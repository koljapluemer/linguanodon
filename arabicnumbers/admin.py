from django.contrib import admin

from arabicnumbers.models import ArabicNumber


@admin.register(ArabicNumber)
class ArabicNumberAdmin(admin.ModelAdmin):
    list_display = ['value', 'numeral', 'script', 'english', 'transliteration']
    search_fields = ['english', 'transliteration']
