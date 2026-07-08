from django.templatetags.static import static

from core.apps_registry import APPS, APPS_BY_SLUG


def apps_registry(request):
    """Expose the practice-apps registry to every template.

    `apps_list` is ordered by state (recommended, then usable, then proof of
    concept) for the index grid; `apps_by_slug` lets an app's own templates
    look up their own entry (e.g. `apps_by_slug.saetze.code`) without
    duplicating name/code/description locally.
    """
    return {
        'apps_list': sorted(APPS, key=lambda app: app.state.sort_order),
        'apps_by_slug': APPS_BY_SLUG,
    }


def favicon(request):
    """Favicon for the app the current route belongs to, if any.

    Each app's `urls.py` sets `app_name` to its registry slug, so this
    resolves automatically for every route under an app - no per-template
    overrides needed. Routes outside any app (e.g. the index page) get no
    favicon_url, and base.html simply omits the <link> tag.
    """
    resolver_match = request.resolver_match
    app = APPS_BY_SLUG.get(resolver_match.app_name) if resolver_match else None
    if app is None:
        return {}
    return {'favicon_url': static(f'{app.slug}/branding/favicon.svg')}
