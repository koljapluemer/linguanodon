from django.db import models


class Language(models.Model):
    name = models.CharField(max_length=64, unique=True)
    code = models.CharField(max_length=8, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Video(models.Model):
    youtube_id = models.CharField(max_length=32)
    title = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='videos')

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    @property
    def thumbnail_url(self):
        return f'https://img.youtube.com/vi/{self.youtube_id}/mqdefault.jpg'

    @property
    def thumbnail_url_large(self):
        return f'https://img.youtube.com/vi/{self.youtube_id}/hqdefault.jpg'
