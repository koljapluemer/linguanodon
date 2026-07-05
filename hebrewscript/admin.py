from django.contrib import admin

from hebrewscript.models import Clip


@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    list_display = ['filename', 'transcript']
    search_fields = ['filename', 'transcript']
