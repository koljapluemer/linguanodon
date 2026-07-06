from django.db import models


class Sentence(models.Model):
    arz = models.TextField()
    transliteration = models.TextField()
    translations = models.JSONField()

    def __str__(self):
        return self.arz


class ClozeWord(models.Model):
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE, related_name='cloze_words')
    word = models.CharField(max_length=64)
    distractors = models.JSONField()

    class Meta:
        ordering = ['sentence_id', 'id']

    def __str__(self):
        return self.word
