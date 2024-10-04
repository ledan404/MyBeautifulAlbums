from rest_framework import serializers
from .models import Album, Artist, Record, Genre, Track


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = "__all__"


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = "__all__"
        depth = 2


class ArtistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Artist
        fields = "__all__"


class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = "__all__"
        depth = 2
