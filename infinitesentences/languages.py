def get_language_codes() -> list[str]:
    from infinitesentences.models import Language
    return list(Language.objects.values_list('code', flat=True))
