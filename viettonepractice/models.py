from django.db import models


class Clip(models.Model):
    filename = models.CharField(max_length=255, primary_key=True)
    transcript = models.TextField()
    word_count = models.PositiveSmallIntegerField()
    used_normalized_audio = models.BooleanField(default=False)

    def __str__(self):
        return self.filename
