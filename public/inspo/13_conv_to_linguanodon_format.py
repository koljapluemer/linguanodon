import json
import os
from urllib.parse import quote

# Input/Output paths
INPUT_PATH = 'usable_sentences_with_vocab.json'
WORDS_OUTPUT_PATH = 'linguanodon_words.json'
SENTENCES_OUTPUT_PATH = 'linguanodon_sentences.json'

# Credits info (static for all sentences)
CREDITS = [{
    "license": "CC-BY-NC-4.0",
    "owner": "guymorlan",
    "ownerLink": "https://huggingface.co/guymorlan",
    "source": "Huggingface - Levanti Dataset",
    "sourceLink": "https://huggingface.co/datasets/guymorlan/levanti"
}]

# Helper to make Wiktionary link for Arabic word
def wiktionary_link(word):
    return f"https://en.wiktionary.org/wiki/{quote(word)}"

# Load input
with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

words_dict = {}  # (lang, content) -> word_obj
sentences_dict = {}  # (lang, content) -> sentence_obj

for entry in data:
    apc_sent = entry['apc']
    eng_sent = entry['eng']
    vocab = entry.get('vocab', [])

    # Sentence objects (both directions)
    sent_apc_obj = {
        "type": "sentence",
        "language": "apc",
        "content": apc_sent,
        "notes": [],
        "translations": [{"type": "sentence", "language": "eng", "content": eng_sent}],
        "links": [],
        "credits": CREDITS,
        "containsWords": [{"type": "word", "language": "apc", "content": v['apc']} for v in vocab if v.get('apc')]
    }
    sent_eng_obj = {
        "type": "sentence",
        "language": "eng",
        "content": eng_sent,
        "notes": [],
        "translations": [{"type": "sentence", "language": "apc", "content": apc_sent}],
        "links": [],
        "credits": CREDITS,
        "containsWords": [{"type": "word", "language": "eng", "content": v['eng']} for v in vocab if v.get('eng')]
    }
    # Only add sentences if they don't already exist
    apc_sent_key = ("apc", apc_sent)
    eng_sent_key = ("eng", eng_sent)
    if apc_sent_key not in sentences_dict:
        sentences_dict[apc_sent_key] = sent_apc_obj
    if eng_sent_key not in sentences_dict:
        sentences_dict[eng_sent_key] = sent_eng_obj

    # Word objects (both directions)
    for v in vocab:
        apc_word = v['apc']
        eng_word = v['eng']
        # Arabic word
        apc_key = ("apc", apc_word)
        if apc_key not in words_dict:
            words_dict[apc_key] = {
                "type": "word",
                "language": "apc",
                "content": apc_word,
                "notes": [{"content": "verb", "showBeforeExercise": True}],  # Placeholder, can be improved
                "translations": [{"type": "word", "language": "eng", "content": eng_word}],
                "links": [{"label": "Wiktionary", "url": wiktionary_link(apc_word)}],
                "otherForms": [],
                "synonyms": [],
                "appearsIn": [{"type": "sentence", "language": "apc", "content": apc_sent}]
            }
        else:
            # Add new sentence to appearsIn if not already present
            appears = words_dict[apc_key]["appearsIn"]
            if not any(s["content"] == apc_sent for s in appears):
                appears.append({"type": "sentence", "language": "apc", "content": apc_sent})
        # English word
        eng_key = ("eng", eng_word)
        if eng_key not in words_dict:
            words_dict[eng_key] = {
                "type": "word",
                "language": "eng",
                "content": eng_word,
                "notes": [{"content": "verb", "showBeforeExercise": True}],  # Placeholder, can be improved
                "translations": [{"type": "word", "language": "apc", "content": apc_word}],
                "links": [],
                "otherForms": [],
                "synonyms": [],
                "appearsIn": [{"type": "sentence", "language": "eng", "content": eng_sent}]
            }
        else:
            appears = words_dict[eng_key]["appearsIn"]
            if not any(s["content"] == eng_sent for s in appears):
                appears.append({"type": "sentence", "language": "eng", "content": eng_sent})

# Convert dicts to lists
words = list(words_dict.values())
sentences = list(sentences_dict.values())

# Save outputs
with open(WORDS_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(words, f, ensure_ascii=False, indent=2)
with open(SENTENCES_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(sentences, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(words)} unique words to {WORDS_OUTPUT_PATH}")
print(f"Wrote {len(sentences)} unique sentences to {SENTENCES_OUTPUT_PATH}")
