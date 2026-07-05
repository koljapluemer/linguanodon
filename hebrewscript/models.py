from django.db import models


class Clip(models.Model):
    filename = models.CharField(max_length=255, primary_key=True)
    transcript = models.TextField()

    def __str__(self):
        return self.filename
