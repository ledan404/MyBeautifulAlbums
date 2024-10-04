from typing import Tuple, Any, Dict, List, Optional
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import status
from rest_framework.response import Response
import requests


from .models import SpotifyToken


def requests_token_spotify(request) -> Response | Tuple[str, int, int]:
    """
    Request an access token from Spotify API using the provided authorization code.
    """
    code = request.GET.get("code", "").rstrip("/")
    if not code:
        return Response(
            {"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        "client_id": settings.SPOTIFY_CLIENT_ID,
        "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        "scope": "user-library-read user-read-email user-read-private",
    }

    try:
        response = requests.post(token_url, data=payload)
        response.raise_for_status()
        response_data = response.json()

        if "error" in response_data:
            return Response(
                {"error": response_data["error"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        access_token = response_data.get("access_token")
        refresh_token = response_data.get("refresh_token")
        expires_in = response_data.get("expires_in")

        if not all([access_token, refresh_token, expires_in]):
            return Response(
                {"error": "Invalid response from Spotify"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return access_token, refresh_token, expires_in

    except requests.RequestException:
        return Response(
            {"error": "Failed to communicate with Spotify API"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def fetch_user_spotify(request, access_token: str) -> Response | Dict[str, Any]:
    """
    Fetch user information from Spotify API.
    """
    user_info_url = "https://api.spotify.com/v1/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    user_info_response = requests.get(user_info_url, headers=headers)
    user_info = user_info_response.json()

    if "error" in user_info:
        return Response(
            {"error": "Failed to retrieve Spotify user info"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return user_info


def refresh_spotify_token(refresh_token: str) -> Optional[Tuple[str, str, int]]:
    """
    Refresh the Spotify access token using the refresh token.
    """
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        },
    )

    if response.status_code == 200:
        data = response.json()
        return (
            data["access_token"],
            data.get("refresh_token", refresh_token),
            data["expires_in"],
        )
    return None


def get_spotify_token(user) -> Optional[SpotifyToken]:
    """
    Get a valid Spotify token for the given user, refreshing if necessary.
    """
    try:
        token = SpotifyToken.objects.get(user=user)
        if token.expires_at <= timezone.now():
            new_token = refresh_spotify_token(token.s_refresh_token)
            if new_token is None:
                return None
            s_access_token, s_refresh_token, s_expires_in = new_token
            token.s_access_token = s_access_token
            token.s_refresh_token = s_refresh_token
            token.expires_at = timezone.now() + timezone.timedelta(seconds=s_expires_in)
            token.save()
        return token
    except SpotifyToken.DoesNotExist:
        return None


def fetch_user_spotify_albums(access_token: str) -> List[str]:
    """
    Fetch the user's saved albums from Spotify.
    """
    url = "https://api.spotify.com/v1/me/albums"
    headers = {"Authorization": f"Bearer {access_token}"}
    album_ids = []

    while url:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break

        data = response.json()
        items = data.get("items", [])

        album_ids.extend(
            item.get("album", {}).get("id")
            for item in items
            if item.get("album", {}).get("id")
        )

        url = data.get("next")

    return album_ids
