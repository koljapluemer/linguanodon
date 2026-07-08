import json

from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.templatetags.static import static
from django.urls import reverse

from infinitesentences.models import Language, LanguagePair, Sentence
from core.apps_registry import nav_context


def landing(request):
    config = {
        'selectNativeLanguageUrl': reverse('infinitesentences:select_native_language'),
        'screenshotUrl': static('infinitesentences/branding/screenshot.webp'),
    }
    context = {'config_json': json.dumps(config), **nav_context('infinitesentences', 'home')}
    return render(request, 'infinite-sentences/landing.html', context)


def select_native_language(request):
    config = {
        'apiLanguagesUrl': reverse('infinitesentences:api_languages'),
        'apiNativeLanguagesUrl': reverse('infinitesentences:api_native_languages'),
        'selectTargetLanguageUrlTemplate': reverse(
            'infinitesentences:select_target_language', kwargs={'native_iso': '__NATIVE_ISO__'}
        ),
    }
    return render(request, 'infinite-sentences/select-native-language.html', {'config_json': json.dumps(config)})


def select_target_language(request, native_iso):
    config = {
        'nativeIso': native_iso,
        'apiLanguagesUrl': reverse('infinitesentences:api_languages'),
        'selectNativeLanguageUrl': reverse('infinitesentences:select_native_language'),
        'apiTargetLanguagesUrl': reverse(
            'infinitesentences:api_target_languages', kwargs={'native_iso': native_iso}
        ),
        'practiceUrlTemplate': reverse(
            'infinitesentences:practice', kwargs={'native_iso': native_iso, 'target_iso': '__TARGET_ISO__'}
        ),
    }
    return render(request, 'infinite-sentences/select-target-language.html', {'config_json': json.dumps(config)})


def practice(request, native_iso, target_iso):
    config = {
        'nativeIso': native_iso,
        'targetIso': target_iso,
        'apiLanguagesUrl': reverse('infinitesentences:api_languages'),
        'apiSentenceCountUrl': reverse(
            'infinitesentences:api_sentence_count',
            kwargs={'native_iso': native_iso, 'target_iso': target_iso},
        ),
        'apiSentenceUrlTemplate': reverse(
            'infinitesentences:api_sentence',
            kwargs={'native_iso': native_iso, 'target_iso': target_iso, 'index': '__INDEX__'},
        ),
    }
    context = {'config_json': json.dumps(config), **nav_context('infinitesentences', 'practice')}
    return render(request, 'infinite-sentences/practice.html', context)


def stats(request):
    config = {
        'apiLanguagesUrl': reverse('infinitesentences:api_languages'),
    }
    context = {'config_json': json.dumps(config), **nav_context('infinitesentences', 'stats')}
    return render(request, 'infinite-sentences/stats.html', context)


def settings_page(request):
    config = {
        'apiLanguagesUrl': reverse('infinitesentences:api_languages'),
        'selectNativeLanguageUrl': reverse('infinitesentences:select_native_language'),
        'selectTargetLanguageUrlTemplate': reverse(
            'infinitesentences:select_target_language', kwargs={'native_iso': '__NATIVE_ISO__'}
        ),
    }
    context = {'config_json': json.dumps(config), **nav_context('infinitesentences', 'settings')}
    return render(request, 'infinite-sentences/settings.html', context)


def api_languages(request):
    data = {
        language.code: {'displayName': language.display_name, 'symbols': language.symbols}
        for language in Language.objects.all()
    }
    return JsonResponse(data)


def api_native_languages(request):
    codes = list(Language.objects.filter(is_native=True).values_list('code', flat=True))
    return JsonResponse(codes, safe=False)


def api_target_languages(request, native_iso):
    codes = list(LanguagePair.objects.filter(native_id=native_iso).values_list('target_id', flat=True))
    return JsonResponse(codes, safe=False)


def api_sentence_count(request, native_iso, target_iso):
    pair = get_object_or_404(LanguagePair, native_id=native_iso, target_id=target_iso)
    return JsonResponse({'count': pair.sentence_count})


def api_sentence(request, native_iso, target_iso, index):
    try:
        index_int = int(index)
    except ValueError:
        raise Http404('Invalid sentence index.')

    sentence = get_object_or_404(
        Sentence.objects.prefetch_related('parts'),
        pair__native_id=native_iso, pair__target_id=target_iso, index=index_int,
    )
    data = {
        'sentence': sentence.text,
        'credits': sentence.credits,
        'translations': sentence.translations,
        'transcription': sentence.transcription,
        'parts': [
            {
                'content': part.content,
                'translations': part.translations,
                'usageExamples': part.usage_examples,
                'transcription': part.transcription,
            }
            for part in sentence.parts.all()
        ],
    }
    return JsonResponse(data)
