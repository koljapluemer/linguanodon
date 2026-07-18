from django.db import models


class Word(models.Model):
    language = models.CharField(max_length=8)  # ISO 639-3: 'vie' | 'arz'
    front = models.TextField()
    back = models.TextField()
    # Optional inline-markdown grammatical/attribution note - unused by any
    # current row, reserved for future per-word sourcing.
    credit = models.TextField(blank=True, default='')

    class Meta:
        indexes = [models.Index(fields=['language'])]
        ordering = ['language', 'id']

    def __str__(self):
        return f'{self.language}:{self.front}'


class Background(models.Model):
    language = models.CharField(max_length=8)
    # File stem matching <stem>.webp under static/boringwords/<language>/ -
    # the source credits CSV says .jpg, the actual files are .webp, so the
    # bare stem keeps this row extension-agnostic.
    filename = models.CharField(max_length=255)
    credit = models.TextField()  # inline markdown, built at import time

    class Meta:
        indexes = [models.Index(fields=['language'])]
        ordering = ['language', 'id']

    def __str__(self):
        return f'{self.language}:{self.filename}'
