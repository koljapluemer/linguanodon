from django.contrib import admin

from saetze.models import Exercise, Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['key', 'name', 'order']
    ordering = ['order']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'cloze', 'correct_answer', 'wrong_answer']
    list_filter = ['lesson']
    search_fields = ['cloze', 'english', 'correct_answer', 'wrong_answer']
