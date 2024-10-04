from django.contrib.auth.models import User, timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from albums.services import process_user_album
from .models import SpotifyToken, UserProfile
from .serializers import (
    SpotifyAuthSerializer,
    SpotifyTokenSerializer,
    UserProfileSerializer,
)
from .services import (
    fetch_user_spotify,
    fetch_user_spotify_albums,
    get_spotify_token,
    refresh_spotify_token,
    requests_token_spotify,
)


class UserProfileViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for user profile operations."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all user profiles."""
        return UserProfile.objects.all()

    def get_object(self):
        """Return the current user's profile."""
        return self.request.user.userprofile

    def list(self, request):
        """List the current user's profile."""
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=["POST"])
    def sync_spotify_library(self, request):
        """Sync the user's Spotify library."""
        user = request.user
        spotify_token = get_spotify_token(user)

        if not spotify_token:
            return Response(
                {"error": "No Spotify token found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        albums = fetch_user_spotify_albums(spotify_token.s_access_token)

        for album_id in albums:
            process_user_album(album_id, user)

        return Response(
            {"message": "Library synced successfully"},
            status=status.HTTP_200_OK,
        )


class SpotifyAuthView(GenericAPIView):
    """View for Spotify authentication."""

    serializer_class = SpotifyAuthSerializer

    def get(self, request):
        """Get the Spotify authentication URL."""
        scope = "user-library-read user-read-private user-read-email"
        auth_url = (
            "https://accounts.spotify.com/authorize"
            "?response_type=code"
            f"&client_id={settings.SPOTIFY_CLIENT_ID}"
            f"&redirect_uri={settings.SPOTIFY_REDIRECT_URI}"
            f"&scope={scope}"
        )
        serializer = self.get_serializer(data={"auth_url": auth_url})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SpotifyCallbackView(GenericAPIView):
    """View for handling Spotify callback."""

    serializer_class = SpotifyTokenSerializer

    def get(self, request):
        """Handle the Spotify callback and retrieve tokens."""
        result = requests_token_spotify(request)
        if isinstance(result, Response):
            return result
        s_access_token, s_refresh_token, s_expires_in = result

        user_info = fetch_user_spotify(request, s_access_token)
        if isinstance(user_info, Response):
            return user_info

        user, created = User.objects.get_or_create(
            username=user_info["id"], first_name=user_info["display_name"]
        )
        if created:
            user.email = user_info.get("email", "")
            user.save()

        UserProfile.objects.update_or_create(
            user=user,
            defaults={
                "img_profile_url": user_info.get("images", [{}])[1].get("url", "")
            },
        )

        SpotifyToken.objects.update_or_create(
            user=user,
            defaults={
                "s_access_token": s_access_token,
                "s_refresh_token": s_refresh_token,
                "s_expires_in": s_expires_in,
                "expires_at": timezone.now() + timezone.timedelta(seconds=s_expires_in),
            },
        )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response_data = {
            "jwt_access_token": access_token,
            "jwt_refresh_token": str(refresh),
            "spotify_access_token": s_access_token,
            "spotify_refresh_token": s_refresh_token,
            "spotify_expires_in": s_expires_in,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class SpotifyRefreshTokenView(APIView):
    """View for refreshing Spotify token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Refresh the Spotify access token."""
        user = request.user
        spotify_token = SpotifyToken.objects.get(user=user)

        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"error": "No refresh token provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_token = refresh_spotify_token(refresh_token)
        if isinstance(new_token, Response):
            return new_token

        s_access_token, s_refresh_token, s_expires_in = new_token

        spotify_token.s_access_token = s_access_token
        spotify_token.s_refresh_token = s_refresh_token
        spotify_token.s_expires_in = s_expires_in
        spotify_token.save()

        return Response(
            {
                "spotify_access_token": s_access_token,
                "spotify_refresh_token": s_refresh_token,
                "spotify_expires_in": s_expires_in,
            },
            status=status.HTTP_200_OK,
        )
