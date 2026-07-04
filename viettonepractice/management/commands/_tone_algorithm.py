"""
Tone-only port of listen-to-viet's src/entities/listening-clip/model.ts.

Only the pieces needed to decide "can this transcript produce a valid
tone-confusion distractor" are ported. Everything letter/vowel-family-cross
related (ACTIVE_LETTER_KEYS, isSupportedLetterPair, alternativeMap's
cross-family section, getConfusionKind) is intentionally NOT ported at all -
with only same-family (tone) alternatives in ALTERNATIVE_MAP, every
generated candidate is a tone candidate by construction.
"""

import re

VOWEL_FAMILIES = [
    ["a", "à", "á", "ả", "ã", "ạ"],
    ["ă", "ằ", "ắ", "ẳ", "ẵ", "ặ"],
    ["â", "ầ", "ấ", "ẩ", "ẫ", "ậ"],
    ["e", "è", "é", "ẻ", "ẽ", "ẹ"],
    ["ê", "ề", "ế", "ể", "ễ", "ệ"],
    ["i", "ì", "í", "ỉ", "ĩ", "ị"],
    ["o", "ò", "ó", "ỏ", "õ", "ọ"],
    ["ô", "ồ", "ố", "ổ", "ỗ", "ộ"],
    ["ơ", "ờ", "ớ", "ở", "ỡ", "ợ"],
    ["u", "ù", "ú", "ủ", "ũ", "ụ"],
    ["ư", "ừ", "ứ", "ử", "ữ", "ự"],
    ["y", "ỳ", "ý", "ỷ", "ỹ", "ỵ"],
]

TONE_KEYS = ["ngang", "huyen", "sac", "hoi", "nga", "nang"]

_TRANSCRIPT_CLEANUP_PATTERN = re.compile(r'(^|\s)-N(?=\s|$)')
_WORD_SPLIT_PATTERN = re.compile(r'\s+')

_EXTRA_VIETNAMESE_LETTERS = [
    "a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n",
    "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y",
]


def _build_character_set(characters):
    result = set()
    for character in characters:
        result.add(character)
        result.add(character.upper())
    return result


_TONE_MARKED_CHARACTERS = [character for family in VOWEL_FAMILIES for character in family[1:]]
_TONE_MARKED_CHARACTER_SET = _build_character_set(_TONE_MARKED_CHARACTERS)
_DEFINITELY_VIETNAMESE_CHARACTER_SET = _build_character_set(
    ["ă", "â", "ê", "ô", "ơ", "ư", "đ", *_TONE_MARKED_CHARACTERS]
)
_VIETNAMESE_ALPHABET_CHARACTER_SET = _build_character_set(
    [*_EXTRA_VIETNAMESE_LETTERS, *_TONE_MARKED_CHARACTERS]
)

_CHARACTER_TONE_MAP = {}
for _family in VOWEL_FAMILIES:
    for _tone_index, _character in enumerate(_family):
        _CHARACTER_TONE_MAP[_character] = TONE_KEYS[_tone_index]
for _character, _tone in list(_CHARACTER_TONE_MAP.items()):
    _CHARACTER_TONE_MAP[_character.upper()] = _tone


def _build_alternative_map():
    alternative_map = {}

    def add_alternative(source, candidate):
        if source == candidate:
            return
        alternative_map.setdefault(source, set()).add(candidate)

    # Same vowel-family, cross-tone alternatives only (tone confusion).
    # The source's cross-family/letter-substitution section is intentionally
    # not ported here.
    for family in VOWEL_FAMILIES:
        for source in family:
            for candidate in family:
                add_alternative(source, candidate)

    # Uppercase mirroring of everything built above.
    for source, candidates in list(alternative_map.items()):
        upper_source = source.upper()
        for candidate in candidates:
            add_alternative(upper_source, candidate.upper())

    return alternative_map


_ALTERNATIVE_MAP = _build_alternative_map()


def normalize_transcript(value):
    value = _TRANSCRIPT_CLEANUP_PATTERN.sub(' ', value)
    value = _WORD_SPLIT_PATTERN.sub(' ', value)
    return value.strip()


def count_words(value):
    normalized = normalize_transcript(value)
    return len(normalized.split(' ')) if normalized else 0


def _get_token_spans(characters):
    spans = []
    token_start = None

    for index, character in enumerate(characters):
        if character.isalpha():
            if token_start is None:
                token_start = index
            continue

        if token_start is not None:
            spans.append((token_start, index))
            token_start = None

    if token_start is not None:
        spans.append((token_start, len(characters)))

    return spans


def _get_token_span_for_index(spans, index):
    for start, end in spans:
        if start <= index < end:
            return start, end
    return None


def _is_vietnamese_confirmed_token(token):
    return any(character in _DEFINITELY_VIETNAMESE_CHARACTER_SET for character in token)


def _has_only_vietnamese_alphabet_characters(token):
    return all(
        not character.isalpha() or character in _VIETNAMESE_ALPHABET_CHARACTER_SET
        for character in token
    )


def _is_valid_source_token(token):
    return _is_vietnamese_confirmed_token(token) and _has_only_vietnamese_alphabet_characters(token)


def _get_tone_marked_character_count(token):
    return sum(1 for character in token if character in _TONE_MARKED_CHARACTER_SET)


def _is_valid_mutated_token(token):
    return _get_tone_marked_character_count(token) <= 1


def can_generate_tone_distractor(transcript):
    """Mirrors canGenerateDistractor(transcript) from model.ts, tone-only."""
    normalized = normalize_transcript(transcript)
    characters = list(normalized)
    token_spans = _get_token_spans(characters)

    for changed_index, character in enumerate(characters):
        if character not in _CHARACTER_TONE_MAP:
            continue

        alternatives = _ALTERNATIVE_MAP.get(character)
        if not alternatives:
            continue

        token_span = _get_token_span_for_index(token_spans, changed_index)
        if token_span is None:
            continue

        start, end = token_span
        source_token = ''.join(characters[start:end])
        if not _is_valid_source_token(source_token):
            continue

        for alternative in alternatives:
            if alternative not in _CHARACTER_TONE_MAP:
                continue

            mutated = list(characters)
            mutated[changed_index] = alternative
            label = ''.join(mutated)
            if label == normalized:
                continue

            mutated_token = ''.join(mutated[start:end])
            if not _is_valid_mutated_token(mutated_token):
                continue

            return True

    return False
