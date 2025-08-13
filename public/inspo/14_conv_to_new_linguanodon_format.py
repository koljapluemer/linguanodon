import json
import os
from urllib.parse import quote

# Input/Output paths
INPUT_PATH = 'usable_sentences_with_vocab.json'
OUTPUT_PATH = 'linguanodon_out_new.json'

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

# Helper to generate unique IDs
def generate_id(content, language, counter_dict):
    # Create a base ID from the content (first 20 chars, lowercase, alphanumeric only)
    base = ''.join(c for c in content[:20].lower() if c.isalnum())
    if not base:
        base = "word"
    
    # Add counter if needed
    if base in counter_dict:
        counter_dict[base] += 1
        return f"{base}-{counter_dict[base]}"
    else:
        counter_dict[base] = 1
        return f"{base}-1"

# Load input
with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Initialize output structure
output = {
    "vocab": [],
    "translations": [],
    "examples": []
}

# Tracking dictionaries
vocab_dict = {}  # (lang, content) -> vocab_obj
translation_dict = {}  # (lang, content) -> translation_obj
example_dict = {}  # (lang, content) -> example_obj
id_counters = {}

for entry in data:
    apc_sent = entry['apc']
    eng_sent = entry['eng']
    vocab = entry.get('vocab', [])

    # Process vocab words (only Arabic)
    for v in vocab:
        apc_word = v['apc']
        eng_word = v['eng']
        
        # Only process Arabic words for vocab
        apc_key = ("apc", apc_word)
        if apc_key not in vocab_dict:
            apc_id = generate_id(apc_word, "apc", id_counters)
            
            # Check if English translation already exists, reuse its ID
            eng_trans_key = ("eng", eng_word)
            if eng_trans_key in translation_dict:
                eng_trans_id = translation_dict[eng_trans_key]["id"]
            else:
                eng_trans_id = generate_id(eng_word, "eng", id_counters)
                translation_dict[eng_trans_key] = {
                    "id": eng_trans_id,
                    "content": eng_word
                }
            
            vocab_dict[apc_key] = {
                "id": apc_id,
                "language": "apc",
                "content": apc_word,
                "notes": [{"content": "verb", "showBeforeExercise": True}],  # Placeholder
                "translations": [eng_trans_id],
                "links": [{"label": "Wiktionary", "url": wiktionary_link(apc_word)}],
                "associatedTasks": []
            }
        else:
            # Arabic word already exists, add this English translation if not already present
            existing_vocab = vocab_dict[apc_key]
            eng_trans_key = ("eng", eng_word)
            if eng_trans_key in translation_dict:
                eng_trans_id = translation_dict[eng_trans_key]["id"]
            else:
                eng_trans_id = generate_id(eng_word, "eng", id_counters)
                translation_dict[eng_trans_key] = {
                    "id": eng_trans_id,
                    "content": eng_word
                }
            
            # Add translation if not already in the list
            if eng_trans_id not in existing_vocab["translations"]:
                existing_vocab["translations"].append(eng_trans_id)

    # Process sentences as examples
    apc_sent_key = ("apc", apc_sent)
    eng_sent_key = ("eng", eng_sent)
    
    if apc_sent_key not in example_dict:
        apc_example_id = generate_id(apc_sent, "apc", id_counters)
        eng_trans_id = generate_id(eng_sent, "eng", id_counters)
        
        # Get associated vocab IDs (only Arabic words)
        associated_vocab = []
        for v in vocab:
            apc_vocab_key = ("apc", v['apc'])
            if apc_vocab_key in vocab_dict:
                associated_vocab.append(vocab_dict[apc_vocab_key]["id"])
        
        example_dict[apc_sent_key] = {
            "id": apc_example_id,
            "language": "apc",
            "content": apc_sent,
            "translation": eng_sent,
            "associatedVocab": associated_vocab,
            "associatedTasks": [],
            "isUserCreated": False,
            "lastDownloadedAt": None
        }
        
        # Don't add sentence translations to translations array
    
    if eng_sent_key not in example_dict:
        eng_example_id = generate_id(eng_sent, "eng", id_counters)
        apc_trans_id = generate_id(apc_sent, "apc", id_counters)
        
        # Get associated vocab IDs (only Arabic words)
        associated_vocab = []
        for v in vocab:
            apc_vocab_key = ("apc", v['apc'])
            if apc_vocab_key in vocab_dict:
                associated_vocab.append(vocab_dict[apc_vocab_key]["id"])
        
        example_dict[eng_sent_key] = {
            "id": eng_example_id,
            "language": "eng",
            "content": eng_sent,
            "translation": apc_sent,
            "associatedVocab": associated_vocab,
            "associatedTasks": [],
            "isUserCreated": False,
            "lastDownloadedAt": None
        }
        
        # Don't add sentence translations to translations array

# Convert to final output format
output["vocab"] = list(vocab_dict.values())
output["translations"] = list(translation_dict.values())
output["examples"] = list(example_dict.values())

# Save output
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(output['vocab'])} unique vocab items to {OUTPUT_PATH}")
print(f"Wrote {len(output['translations'])} unique translations to {OUTPUT_PATH}")
print(f"Wrote {len(output['examples'])} unique examples to {OUTPUT_PATH}")
