from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.models import User
from albums.serializers import RecordSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    records = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["user", "img_profile_url", "records"]

    def get_records(self, obj):
        records = (
            obj.records.all()
            .select_related("album")
            .prefetch_related("album__artist", "album__genres", "album__tracks")
        )
        return RecordSerializer(records, many=True, context=self.context).data


class SpotifyAuthSerializer(serializers.Serializer):
    auth_url = serializers.CharField()


class SpotifyTokenSerializer(serializers.Serializer):
    s_access_token = serializers.CharField()
    s_refresh_token = serializers.CharField()
    s_expires_in = serializers.IntegerField()


class SpotifyTokenRefreshSerializer(serializers.Serializer):
    s_access_token = serializers.CharField()
    s_expires_in = serializers.IntegerField()


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()
