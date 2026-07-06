from django.contrib import admin

from egyptiansentences.models import ClozeWord, Sentence


@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    list_display = ['arz', 'transliteration']
    search_fields = ['arz', 'transliteration', 'translations']


@admin.register(ClozeWord)
class ClozeWordAdmin(admin.ModelAdmin):
    list_display = ['sentence', 'word']
    list_filter = ['sentence']
    search_fields = ['word']
