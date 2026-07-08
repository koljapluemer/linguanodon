from django import template

from core.languages import language_display as _language_display

register = template.Library()


@register.filter(name='language_display')
def language_display(slug):
    return _language_display(slug)
