from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from .models import Album, Artist, Genre, Record, Track
from .services import process_record_album
from .serializers import (
    AlbumSerializer,
    ArtistSerializer,
    GenreSerializer,
    RecordSerializer,
    TrackSerializer,
)


class GenreViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing genres."""

    permission_classes = [IsAdminUser]
    serializer_class = GenreSerializer

    def get_queryset(self):
        """Return all genres."""
        return Genre.objects.all()


class TrackViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing tracks."""

    permission_classes = [IsAdminUser]
    serializer_class = TrackSerializer

    def get_queryset(self):
        """Return all tracks with related artists."""
        return Track.objects.prefetch_related("artist")


class AlbumViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing albums."""

    serializer_class = AlbumSerializer

    def get_queryset(self):
        """Return all albums with related artists, genres, and tracks."""
        return Album.objects.prefetch_related("artist", "genres", "tracks")


class ArtistViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing artists."""

    permission_classes = [IsAdminUser]

    serializer_class = ArtistSerializer

    def get_queryset(self):
        """Return all artists."""
        return Artist.objects.all()


class RecordViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing records."""

    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all records with related albums."""
        return Record.objects.select_related("album")


class AddAlbumToRecordView(APIView):
    """API view for adding albums to records."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle the addition of an album to a record."""
        album_id = request.data.get("album_id")
        action = request.data.get("action", {})

        if not album_id:
            return Response(
                {"error": "Album ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not action or "type" not in action or "value" not in action:
            return Response(
                {"error": "Action type and value are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action_type = action["type"]
        process_record_album(album_id, request.user, action_type)
        return Response({"success": True}, status=status.HTTP_200_OK)
