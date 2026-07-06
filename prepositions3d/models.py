from django.db import models


class Language(models.Model):
    code = models.CharField(max_length=8, primary_key=True)
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class GlossTask(models.Model):
    key = models.SlugField(max_length=64, primary_key=True)
    order = models.PositiveIntegerField(unique=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.key


class Translation(models.Model):
    task = models.ForeignKey(GlossTask, on_delete=models.CASCADE, related_name='translations')
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='translations')
    text = models.TextField()
    audio_path = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['task', 'language'], name='unique_translation_per_task_language'),
        ]
        ordering = ['task_id', 'language_id']

    def __str__(self):
        return f'{self.task_id} ({self.language_id})'
