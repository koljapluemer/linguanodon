from core.apps_registry import APPS, APPS_BY_SLUG


def apps_registry(request):
    """Expose the practice-apps registry to every template.

    `apps_list` is ordered (for the index grid); `apps_by_slug` lets an
    app's own templates look up their own entry (e.g. `apps_by_slug.saetze.logo`)
    without duplicating name/logo/description locally.
    """
    return {
        'apps_list': APPS,
        'apps_by_slug': APPS_BY_SLUG,
    }
