from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, related_name="userprofile", on_delete=models.CASCADE
    )
    img_profile_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


class SpotifyToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    s_access_token = models.CharField(max_length=255)
    s_refresh_token = models.CharField(max_length=255)
    s_expires_in = models.IntegerField(null=True)
    s_created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.s_expires_in and not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(
                seconds=self.s_expires_in
            )
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.expires_at and timezone.now() >= self.expires_at
