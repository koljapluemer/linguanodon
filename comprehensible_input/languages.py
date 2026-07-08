def get_language_codes() -> list[str]:
    from comprehensible_input.models import Language
    return list(
        Language.objects.filter(videos__isnull=False).distinct().values_list('code', flat=True)
    )
