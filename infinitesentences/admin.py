from django.contrib import admin

from infinitesentences.models import Language, LanguagePair, Sentence, SentencePart


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['code', 'display_name', 'is_native']
    list_filter = ['is_native']
    search_fields = ['code', 'display_name']


@admin.register(LanguagePair)
class LanguagePairAdmin(admin.ModelAdmin):
    list_display = ['native', 'target', 'sentence_count']
    list_filter = ['native', 'target']


@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    list_display = ['pair', 'index', 'text']
    list_filter = ['pair']
    search_fields = ['text']


@admin.register(SentencePart)
class SentencePartAdmin(admin.ModelAdmin):
    list_display = ['sentence', 'order', 'content']
    search_fields = ['content']
