from django.db import models


class ArabicNumber(models.Model):
    value = models.PositiveSmallIntegerField(primary_key=True)
    numeral = models.CharField(max_length=8)
    script = models.CharField(max_length=64)
    english = models.CharField(max_length=32)
    transliteration = models.CharField(max_length=64)

    class Meta:
        ordering = ['value']

    def __str__(self):
        return f'{self.value} ({self.english})'
