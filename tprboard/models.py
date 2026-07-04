from django.db import models


class Locale(models.Model):
    code = models.CharField(max_length=8, primary_key=True)
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class BoardObject(models.Model):
    slug = models.SlugField(max_length=64, primary_key=True)
    order = models.PositiveIntegerField(unique=True)
    model_path = models.CharField(max_length=255)
    hold_anchor_x = models.FloatField(null=True, blank=True)
    hold_anchor_y = models.FloatField(null=True, blank=True)
    hold_anchor_z = models.FloatField(null=True, blank=True)
    hold_scale = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.slug


class RelationshipEffect(models.TextChoices):
    NOTHING = 'NOTHING'
    RETURN = 'RETURN'
    DISAPPEAR = 'DISAPPEAR'
    DESTRUCT = 'DESTRUCT'
    WIGGLE = 'WIGGLE'
    HELD = 'HELD'


class ObjectRelationship(models.Model):
    source = models.ForeignKey(BoardObject, related_name='outgoing_relationships', on_delete=models.CASCADE)
    target = models.ForeignKey(BoardObject, related_name='incoming_relationships', on_delete=models.CASCADE)
    verb = models.CharField(max_length=64)
    source_effect = models.CharField(max_length=16, choices=RelationshipEffect.choices)
    target_effect = models.CharField(max_length=16, choices=RelationshipEffect.choices)
    task_key = models.CharField(max_length=160, unique=True, editable=False, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['source', 'target'], name='unique_relationship_per_pair'),
        ]

    def save(self, *args, **kwargs):
        if not self.task_key:
            self.task_key = f'{self.source_id}_{self.verb}_{self.target_id}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.task_key


class SentenceFormulation(models.Model):
    locale = models.ForeignKey(Locale, on_delete=models.CASCADE, related_name='formulations')
    relationship = models.ForeignKey(ObjectRelationship, on_delete=models.CASCADE, related_name='formulations')
    order = models.PositiveSmallIntegerField()
    text = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['locale', 'relationship', 'order'], name='unique_formulation_slot'),
        ]
        ordering = ['relationship_id', 'locale_id', 'order']

    @property
    def audio_filename(self):
        return f'{self.relationship.task_key}-{self.order + 1}.mp3'

    def __str__(self):
        return f'{self.locale_id}: {self.text[:40]}'
