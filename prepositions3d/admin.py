from django.contrib import admin

from prepositions3d.models import GlossTask, Language, Translation


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']


@admin.register(GlossTask)
class GlossTaskAdmin(admin.ModelAdmin):
    list_display = ['key', 'order']
    ordering = ['order']


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    list_display = ['task', 'language', 'text', 'audio_path']
    list_filter = ['language']
    search_fields = ['task__key', 'text']
