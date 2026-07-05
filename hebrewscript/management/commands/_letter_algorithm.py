HEBREW_LETTER_KEYS = (
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
    'כ', 'ך', 'ל', 'מ', 'ם', 'נ', 'ן', 'ס', 'ע', 'פ',
    'ף', 'צ', 'ץ', 'ק', 'ר', 'ש', 'ת',
)

_HEBREW_LETTER_SET = set(HEBREW_LETTER_KEYS)


def can_generate_distractor(transcript):
    """Mirrors app/model.js's canGenerateDistractor: a distractor exists as
    soon as the transcript contains one Hebrew letter, since swapping it for
    any other letter in the 27-letter alphabet always changes the string."""
    return any(character in _HEBREW_LETTER_SET for character in transcript)
