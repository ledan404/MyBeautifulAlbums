from rest_framework import routers
from django.urls import include, path
from .views import (
    SpotifyAuthView,
    SpotifyCallbackView,
    UserProfileViewSet,
    SpotifyRefreshTokenView,
)
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
router.register("profile", UserProfileViewSet, basename="user.views")

urlpatterns = [
    path("", include(router.urls)),
    path("spotify/login/", SpotifyAuthView.as_view(), name="spotify-login"),
    path("spotify/callback/", SpotifyCallbackView.as_view(), name="spotify-callback"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "spotify/refresh-token/",
        SpotifyRefreshTokenView.as_view(),
        name="spotify-refresh-token",
    ),
    path(
        "sync-spotify-library/",
        UserProfileViewSet.as_view({"post": "sync_spotify_library"}),
        name="sync-spotify-library",
    ),
]
app_name = "user"
