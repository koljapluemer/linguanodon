from django.conf import settings
from django.db import models


class ActivityEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_events')
    app_label = models.CharField(max_length=64)
    event_type = models.CharField(max_length=64)
    occurred_at = models.DateTimeField()
    client_uuid = models.UUIDField(unique=True)
    magnitude = models.FloatField(default=1)
    payload = models.JSONField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'app_label', 'event_type', 'occurred_at']),
        ]

    def __str__(self):
        return f'{self.user_id}:{self.app_label}:{self.event_type}@{self.occurred_at}'


class LearningState(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_states')
    app_label = models.CharField(max_length=64)
    item_key = models.CharField(max_length=255)
    state = models.JSONField()
    updated_at = models.DateTimeField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'app_label', 'item_key'], name='unique_learning_state_item'),
        ]

    def __str__(self):
        return f'{self.user_id}:{self.app_label}:{self.item_key}'
