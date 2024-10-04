from django.urls import include, path
from .views import (
    AlbumViewSet,
    ArtistViewSet,
    RecordViewSet,
    GenreViewSet,
    TrackViewSet,
    AddAlbumToRecordView,
)
from rest_framework import routers

router = routers.DefaultRouter()
router.register("albums", AlbumViewSet, basename="album.views")
router.register("artists", ArtistViewSet, basename="artist.views")
router.register("records", RecordViewSet, basename="record.views")
router.register("genres", GenreViewSet, basename="genre.views")
router.register("tracks", TrackViewSet, basename="track.views")

urlpatterns = [
    path("", include(router.urls)),
    path("add_album/", AddAlbumToRecordView.as_view(), name="record-album"),
]


app_name = "albums"
