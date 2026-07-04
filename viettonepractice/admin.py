from django.contrib import admin

from viettonepractice.models import Clip


@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    list_display = ['filename', 'word_count', 'used_normalized_audio', 'transcript']
    search_fields = ['filename', 'transcript']
    list_filter = ['used_normalized_audio']
