from django.db import models


class Language(models.Model):
    code = models.CharField(max_length=8, primary_key=True)
    display_name = models.CharField(max_length=64)
    symbols = models.JSONField(default=list)
    is_native = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_name']

    def __str__(self):
        return self.display_name


class LanguagePair(models.Model):
    native = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='pairs_as_native')
    target = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='pairs_as_target')
    sentence_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [['native', 'target']]
        ordering = ['native_id', 'target_id']

    def __str__(self):
        return f'{self.native_id} -> {self.target_id}'


class Sentence(models.Model):
    pair = models.ForeignKey(LanguagePair, on_delete=models.CASCADE, related_name='sentences')
    index = models.PositiveIntegerField()
    text = models.TextField()
    translations = models.JSONField(default=list)
    credits = models.JSONField(default=list)
    transcription = models.TextField(blank=True, default='')

    class Meta:
        unique_together = [['pair', 'index']]
        ordering = ['pair_id', 'index']

    def __str__(self):
        return self.text


class SentencePart(models.Model):
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE, related_name='parts')
    order = models.PositiveIntegerField()
    content = models.TextField()
    translations = models.JSONField(default=list)
    usage_examples = models.JSONField(default=list)
    transcription = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['sentence_id', 'order']

    def __str__(self):
        return self.content
