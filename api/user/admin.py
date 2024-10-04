from django.contrib import admin
from .models import UserProfile, SpotifyToken

admin.site.register(UserProfile)
admin.site.register(SpotifyToken)
