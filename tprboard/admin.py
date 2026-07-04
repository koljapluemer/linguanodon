from django.contrib import admin

from tprboard.models import BoardObject, Locale, ObjectRelationship, SentenceFormulation


@admin.register(Locale)
class LocaleAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']


@admin.register(BoardObject)
class BoardObjectAdmin(admin.ModelAdmin):
    list_display = ['slug', 'order', 'model_path']
    ordering = ['order']


@admin.register(ObjectRelationship)
class ObjectRelationshipAdmin(admin.ModelAdmin):
    list_display = ['task_key', 'source', 'verb', 'target', 'source_effect', 'target_effect']
    search_fields = ['task_key']


@admin.register(SentenceFormulation)
class SentenceFormulationAdmin(admin.ModelAdmin):
    list_display = ['relationship', 'locale', 'order', 'text']
    list_filter = ['locale']
