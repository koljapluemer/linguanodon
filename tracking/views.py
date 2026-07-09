import json
import uuid
from datetime import datetime, timedelta, timezone as dt_timezone

from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from core.apps_registry import APPS
from tracking.models import ActivityEvent, LearningState

MAX_EVENTS_PER_SYNC = 500
MAX_STATES_PER_SYNC = 200
MAX_CLOCK_SKEW = timedelta(minutes=5)
DASHBOARD_WINDOW_DAYS = 30

# Fixed order for stacking/coloring apps on the dashboard, so a series' color stays put as more
# apps get wired up rather than shifting whenever alphabetical sort would insert one earlier.
# Sourced from the app registry (core/apps_registry.py) so it can't drift out of sync with the
# actual set of practice apps.
KNOWN_APP_ORDER = [app.slug for app in APPS]


def _app_sort_key(app_label):
    try:
        return (0, KNOWN_APP_ORDER.index(app_label))
    except ValueError:
        return (1, app_label)


def _epoch_ms_to_datetime(value):
    return datetime.fromtimestamp(int(value) / 1000, tz=dt_timezone.utc)


def _clamp_to_now(value, now):
    return now if value > now + MAX_CLOCK_SKEW else value


def _parse_sync_payload(request):
    if request.content_type == 'application/json':
        return json.loads(request.body)

    # navigator.sendBeacon can't set a JSON content-type reliably across browsers, so the
    # unload-time flush posts urlencoded form data instead, with the batch JSON in `payload`.
    raw = request.POST.get('payload')
    if raw is None:
        raise ValueError('Missing payload field')
    return json.loads(raw)


@login_required
@require_POST
def sync(request):
    try:
        data = _parse_sync_payload(request)
    except (ValueError, TypeError, json.JSONDecodeError):
        return HttpResponseBadRequest('Invalid payload')

    events = data.get('events') or []
    states = data.get('states') or []

    if len(events) > MAX_EVENTS_PER_SYNC or len(states) > MAX_STATES_PER_SYNC:
        return HttpResponseBadRequest('Batch too large')

    now = timezone.now()

    event_objs = []
    for event in events:
        try:
            event_objs.append(ActivityEvent(
                user=request.user,
                app_label=str(event['app_label']),
                event_type=str(event['event_type']),
                occurred_at=_clamp_to_now(_epoch_ms_to_datetime(event['occurred_at']), now),
                client_uuid=uuid.UUID(str(event['client_uuid'])),
                magnitude=float(event.get('magnitude', 1)),
                payload=event.get('payload'),
            ))
        except (KeyError, ValueError, TypeError):
            continue

    if event_objs:
        ActivityEvent.objects.bulk_create(event_objs, ignore_conflicts=True)

    merged_states = {}
    for entry in states:
        try:
            app_label = str(entry['app_label'])
            item_key = str(entry['item_key'])
            updated_at = _clamp_to_now(_epoch_ms_to_datetime(entry['updated_at']), now)
            value = entry['state']
        except (KeyError, ValueError, TypeError):
            continue

        with transaction.atomic():
            row, created = LearningState.objects.select_for_update().get_or_create(
                user=request.user,
                app_label=app_label,
                item_key=item_key,
                defaults={'state': value, 'updated_at': updated_at},
            )
            if not created and updated_at > row.updated_at:
                row.state = value
                row.updated_at = updated_at
                row.save(update_fields=['state', 'updated_at'])

        merged_states[item_key] = {'state': row.state, 'updated_at': row.updated_at.isoformat()}

    return JsonResponse({'states': merged_states})


@login_required
@require_GET
def state(request, app_label):
    rows = LearningState.objects.filter(user=request.user, app_label=app_label)
    payload = {row.item_key: {'state': row.state, 'updated_at': row.updated_at.isoformat()} for row in rows}
    return JsonResponse(payload)


@login_required
@require_GET
def dashboard(request):
    today = timezone.localdate()
    cutoff = today - timedelta(days=DASHBOARD_WINDOW_DAYS - 1)

    rows = list(
        ActivityEvent.objects
        .filter(user=request.user, event_type__in=('trial', 'active_time'), occurred_at__date__gte=cutoff)
        .annotate(day=TruncDate('occurred_at'))
        .values('day', 'app_label', 'event_type')
        .annotate(total=Sum('magnitude'))
    )

    start = min((row['day'] for row in rows), default=today - timedelta(days=DASHBOARD_WINDOW_DAYS - 1))
    days = [start + timedelta(days=offset) for offset in range((today - start).days + 1)]
    apps = sorted({row['app_label'] for row in rows}, key=_app_sort_key)

    trials = {day.isoformat(): dict.fromkeys(apps, 0) for day in days}
    active_minutes = {day.isoformat(): dict.fromkeys(apps, 0) for day in days}

    for row in rows:
        day_key = row['day'].isoformat()
        if row['event_type'] == 'trial':
            trials[day_key][row['app_label']] = row['total']
        elif row['event_type'] == 'active_time':
            active_minutes[day_key][row['app_label']] = row['total'] / 60000

    data = {
        'days': [day.isoformat() for day in days],
        'apps': apps,
        'trials': trials,
        'activeMinutes': active_minutes,
    }

    return render(request, 'tracking/dashboard.html', {'data_json': json.dumps(data)})
