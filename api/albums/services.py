import requests
from django.contrib.auth.models import User

from albums.models import Album, Artist, Genre, Record, Track
from user.services import get_spotify_token


def fetch_spotify_album(token: str, album_id: str) -> dict | None:
    """Fetch album data from Spotify API."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    url = f"https://api.spotify.com/v1/albums/{album_id}"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching album data: {response.status_code}")
        return None


def create_or_get_artist(artist_info: dict) -> Artist:
    """Create or get an artist instance."""
    return Artist.objects.get_or_create(
        spotify_id=artist_info["id"],
        defaults={
            "name": artist_info["name"],
            "source_url": artist_info["external_urls"]["spotify"],
        },
    )[0]


def create_or_get_track(track_info: dict) -> Track:
    """Create or get a track instance."""
    return Track.objects.get_or_create(
        spotify_id=track_info["id"],
        defaults={
            "name": track_info["name"],
            "duration_ms": track_info["duration_ms"],
            "track_number": track_info["track_number"],
            "source_url": track_info["external_urls"]["spotify"],
            "is_explicit": track_info["explicit"],
        },
    )[0]


def process_album(album_info: dict, album: Album) -> None:
    """Process album information and update the database."""
    for track_info in album_info.get("tracks", {}).get("items", []):
        track = create_or_get_track(track_info)
        for artist_info in track_info["artists"]:
            artist = create_or_get_artist(artist_info)
            track.artist.add(artist)
        album.tracks.add(track)

    for artist_info in album_info["artists"]:
        artist = create_or_get_artist(artist_info)
        album.artist.add(artist)

    for genre_name in album_info["genres"]:
        genre, _ = Genre.objects.get_or_create(name=genre_name)
        album.genres.add(genre)


def process_user_album(album_id: str, user: User) -> None:
    """Process and save user album data."""
    token = get_spotify_token(user)
    album_data = fetch_spotify_album(token.s_access_token, album_id)

    if not album_data:
        return

    album_info = album_data
    album, _ = Album.objects.get_or_create(
        spotify_id=album_info["id"],
        defaults={
            "name": album_info["name"],
            "release_date": album_info["release_date"],
            "img_url": (
                album_info["images"][0]["url"] if album_info["images"] else None
            ),
            "source_url": album_info["external_urls"]["spotify"],
            "copyright": album_info["copyrights"][0]["text"],
            "label": album_info["label"],
            "popularity": album_info["popularity"],
        },
    )

    process_album(album_info, album)

    Record.objects.update_or_create(
        album=album,
        userprofile=user.userprofile,
        defaults={"is_liked": True},
    )


def process_record_album(album_id: str, user: User, type: str) -> None:
    """Process album record based on user interaction type."""
    token = get_spotify_token(user)
    album_data = fetch_spotify_album(token.s_access_token, album_id)

    if not album_data:
        return

    album_info = album_data
    album, _ = Album.objects.get_or_create(
        spotify_id=album_info["id"],
        defaults={
            "name": album_info["name"],
            "release_date": album_info["release_date"],
            "img_url": (
                album_info["images"][0]["url"] if album_info["images"] else None
            ),
            "source_url": album_info["external_urls"]["spotify"],
            "copyright": album_info["copyrights"][0]["text"],
            "label": album_info["label"],
            "popularity": album_info["popularity"],
        },
    )

    process_album(album_info, album)

    match type:
        case "isLiked":
            Record.objects.update_or_create(
                album=album,
                userprofile=user.userprofile,
                defaults={
                    "is_liked": not Record.objects.filter(
                        album=album, userprofile=user.userprofile
                    )
                    .values_list("is_liked", flat=True)
                    .first()
                    or False
                },
            )
        case "isLoved":
            Record.objects.update_or_create(
                album=album,
                userprofile=user.userprofile,
                defaults={
                    "is_loved": not Record.objects.filter(
                        album=album, userprofile=user.userprofile
                    )
                    .values_list("is_loved", flat=True)
                    .first()
                    or False
                },
            )
        case "isListened":
            Record.objects.update_or_create(
                album=album,
                userprofile=user.userprofile,
                defaults={
                    "is_listened": not Record.objects.filter(
                        album=album, userprofile=user.userprofile
                    )
                    .values_list("is_listened", flat=True)
                    .first()
                    or False
                },
            )
        case "wantToListen":
            Record.objects.update_or_create(
                album=album,
                userprofile=user.userprofile,
                defaults={
                    "want_to_listen": not Record.objects.filter(
                        album=album, userprofile=user.userprofile
                    )
                    .values_list("want_to_listen", flat=True)
                    .first()
                    or False
                },
            )
        case _:
            return None
