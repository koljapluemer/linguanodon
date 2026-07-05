from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        NEW = 'NEW'
        TRUSTED = 'TRUSTED'
        MODERATOR = 'MODERATOR'
        ADMIN = 'ADMIN'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.NEW)
