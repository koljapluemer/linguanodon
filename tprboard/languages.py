def get_language_codes() -> list[str]:
    from tprboard.models import Locale
    return list(Locale.objects.values_list('code', flat=True))
