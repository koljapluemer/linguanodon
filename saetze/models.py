from django.db import models


class Lesson(models.Model):
    key = models.SlugField(max_length=64, primary_key=True)
    name = models.CharField(max_length=128)
    order = models.PositiveIntegerField(unique=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Exercise(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='exercises')
    english = models.TextField()
    english_credit = models.TextField()
    cloze = models.TextField()
    correct_answer = models.CharField(max_length=128)
    wrong_answer = models.CharField(max_length=128)
    german_credit = models.TextField()

    class Meta:
        ordering = ['lesson_id', 'id']

    def __str__(self):
        return self.cloze
