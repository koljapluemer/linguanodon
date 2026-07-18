from django.contrib import admin

from boringwords.models import Background, Word


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['front', 'back', 'language']
    list_filter = ['language']
    search_fields = ['front', 'back']


@admin.register(Background)
class BackgroundAdmin(admin.ModelAdmin):
    list_display = ['filename', 'language']
    list_filter = ['language']
    search_fields = ['filename']
