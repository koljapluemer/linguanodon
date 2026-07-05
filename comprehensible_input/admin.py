from django.contrib import admin

from comprehensible_input.models import Language, Video


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'youtube_id']
    list_filter = ['language']
    search_fields = ['title', 'youtube_id']
