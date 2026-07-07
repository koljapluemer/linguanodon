from django.contrib import admin

from tracking.models import ActivityEvent, LearningState


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'app_label', 'event_type', 'magnitude', 'occurred_at']
    list_filter = ['app_label', 'event_type']
    search_fields = ['user__username']


@admin.register(LearningState)
class LearningStateAdmin(admin.ModelAdmin):
    list_display = ['user', 'app_label', 'item_key', 'updated_at']
    list_filter = ['app_label']
    search_fields = ['user__username', 'item_key']
