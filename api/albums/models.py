from django.db import models

from user.models import UserProfile


class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Genre"
        verbose_name_plural = "Genres"


class Artist(models.Model):
    spotify_id = models.CharField(
        max_length=100, unique=True, db_index=True, null=True, blank=True
    )
    source_url = models.URLField(null=True, blank=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Artist"
        verbose_name_plural = "Artists"


class Track(models.Model):
    spotify_id = models.CharField(
        max_length=100, unique=True, db_index=True, null=True, blank=True
    )
    name = models.CharField(max_length=100)
    artist = models.ManyToManyField(Artist, related_name="artists")
    duration_ms = models.IntegerField()
    track_number = models.IntegerField(default=1)
    source_url = models.URLField(null=True, blank=True)
    is_explicit = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Track"
        verbose_name_plural = "Tracks"


class Album(models.Model):
    spotify_id = models.CharField(
        max_length=100, unique=True, db_index=True, null=True, blank=True
    )
    name = models.CharField(max_length=100)
    artist = models.ManyToManyField(Artist, related_name="albums")
    release_date = models.CharField(max_length=100, null=True, blank=True)
    img_url = models.URLField(null=True, blank=True)
    source_url = models.URLField(null=True, blank=True)
    tracks = models.ManyToManyField(Track, related_name="tracks")
    genres = models.ManyToManyField(Genre, related_name="genres")
    copyright = models.CharField(max_length=100, null=True, blank=True)
    label = models.CharField(max_length=100, null=True, blank=True)
    popularity = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Album"
        verbose_name_plural = "Albums"


class Record(models.Model):
    date_added = models.DateField(auto_now=True)
    is_liked = models.BooleanField(default=False)
    is_loved = models.BooleanField(default=False)
    is_listened = models.BooleanField(default=False)
    want_to_listen = models.BooleanField(default=False)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, blank=True, null=True)
    userprofile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="records"
    )

    def __str__(self):
        return f"{self.album.name} - {self.date_added}"

    @property
    def user(self):
        return self.userprofile.user
