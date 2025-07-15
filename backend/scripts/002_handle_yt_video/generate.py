#!/usr/bin/env python3
"""
Script to download YouTube subtitles and extract vocabulary using OpenAI.
Creates RemoteSet structure for language learning data.
"""

import os
import json
import sys
from typing import List, Dict, Any, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
from collections import Counter, defaultdict
import re

# =====================
# CONFIGURATION
# =====================
VIDEO_ID = "r4psGFKZQqQ"  # YouTube video ID
VIDEO_SUBTITLE_LANGUAGE = "ar"  # Language code for subtitles (YouTube's code)
TARGET_LANG_CODE = "apc"  # Output language code for units
OUTPUT_FILE = f"/home/brokkoli/GITHUB/linguanodon/backend/data/youtube_{VIDEO_ID}.json"  # Set this to any absolute or relative path you want
# =====================

# Load environment variables from .env file
load_dotenv()

# Types
class VocabObject:
    def __init__(self, original: str, translation: str):
        self.original = original.strip()
        self.translation = translation.strip()
    def __hash__(self):
        return hash((self.original, self.translation))
    def __eq__(self, other):
        return (self.original, self.translation) == (other.original, other.translation)

# Download subtitles (returns list of lines)
def download_subtitles(video_id: str, lang_code: str) -> Tuple[List[str], str]:
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript([lang_code])
        fetched_transcript = transcript.fetch()
        lines = [entry.text.strip() for entry in fetched_transcript if entry.text.strip()]
        print(f"Downloaded {len(lines)} subtitle lines (language: {transcript.language_code})")
        return lines, transcript.language_code
    except Exception as e:
        print(f"Error downloading subtitles: {e}")
        sys.exit(1)

def get_openai_client() -> OpenAI:
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    return OpenAI(api_key=api_key)

def extract_vocab_from_line(line: str, source_language_code: str, client: OpenAI) -> List[VocabObject]:
    prompt = f"""You are an expert in language teaching.\n\nExtract language learning vocabulary from the following subtitle snippet in {source_language_code} language.\n\nGuidelines:\n- Extract meaningful words and phrases that would be useful for language learners\n- Ignore music indicators like [موسيقى] or [music]\n- Extract even single words if they are meaningful vocabulary\n- Ignore proper nouns (names, places, brands), exclamations (oh, wow), and non-translatable words\n- For each extracted word/phrase, provide an English translation suitable for learning\n- Retain correct capitalization and spelling\n- Focus on common, everyday vocabulary that learners would encounter\n- Even if snippets are short, extract any meaningful vocabulary\n- Avoid!! comma-separated synonyms. Simply give the most fitting translation!\n- Only add the pure words/expressions themselves. Do not add notes or extra infos.\n\nReturn your answer as a JSON array with objects containing 'original' and 'translation' fields.\n\nSubtitle snippet to analyze:\n{line}\n"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant specialized in language learning and vocabulary extraction. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        print(f"OpenAI Response for line: {line}\n{content}\n")
        parsed = json.loads(content)
        # Accept both array and object with 'vocabulary' or 'words' keys
        if isinstance(parsed, list):
            return [VocabObject(obj.get('original') or obj.get('word'), obj.get('translation')) for obj in parsed if obj.get('original') or obj.get('word')]
        elif 'vocabulary' in parsed:
            return [VocabObject(obj.get('original') or obj.get('word'), obj.get('translation')) for obj in parsed['vocabulary'] if obj.get('original') or obj.get('word')]
        elif 'words' in parsed:
            return [VocabObject(obj.get('original') or obj.get('word'), obj.get('translation')) for obj in parsed['words'] if obj.get('original') or obj.get('word')]
        else:
            return []
    except Exception as e:
        print(f"Error extracting vocabulary: {e}")
        print(f"Response content: {content if 'content' in locals() else 'No content'}")
        return []

def aggregate_vocab_objects(vocab_objects: List[VocabObject]):
    # Count frequency by original
    freq_counter = Counter([v.original for v in vocab_objects])
    # Get top 50 most common originals
    top_50_originals = set([item[0] for item in freq_counter.most_common(50)])
    # Group all translations for each original
    original_to_translations = defaultdict(set)
    translation_to_originals = defaultdict(set)
    for v in vocab_objects:
        original_to_translations[v.original].add(v.translation)
        translation_to_originals[v.translation].add(v.original)
    return top_50_originals, original_to_translations, translation_to_originals

def build_units_of_meaning(original_to_translations, translation_to_originals, lang_code: str, top_50_originals: set):
    # Each (language, content) must be unique, but translations can be multiple
    units_by_key = dict()  # (lang, content) -> unit
    # Originals (target language)
    for original, translations in original_to_translations.items():
        key = (lang_code, original)
        if key not in units_by_key:
            units_by_key[key] = {
                "language": lang_code,
                "content": original,
                "translations": []
            }
        for t in translations:
            units_by_key[key]["translations"].append({"language": "eng", "content": t})
    # Translations (English)
    for translation, originals in translation_to_originals.items():
        key = ("eng", translation)
        if key not in units_by_key:
            units_by_key[key] = {
                "language": "eng",
                "content": translation,
                "translations": []
            }
        for o in originals:
            units_by_key[key]["translations"].append({"language": lang_code, "content": o})
    # Split into primary and secondary
    primary, secondary = [], []
    for (lang, content), unit in units_by_key.items():
        if lang == lang_code and content in top_50_originals:
            primary.append(unit)
        elif lang == lang_code:
            secondary.append(unit)
    return primary, secondary, units_by_key

def main():
    print(f"Processing YouTube video: {VIDEO_ID}")
    client = get_openai_client()
    # Download subtitles
    print("Downloading subtitles...")
    lines, subtitle_lang_code = download_subtitles(VIDEO_ID, VIDEO_SUBTITLE_LANGUAGE)
    print("\n--- SUBTITLE DEBUG (first 3 lines) ---")
    for i, line in enumerate(lines[:3]):
        print(f"Line {i+1}: {line}")
    print("--- END SUBTITLE DEBUG ---\n")
    # Extract vocab for each line
    all_vocab = []
    for idx, line in enumerate(lines):
        print(f"\nProcessing line {idx+1}/{len(lines)}: {line}")
        vocab_objs = extract_vocab_from_line(line, subtitle_lang_code, client)
        all_vocab.extend(vocab_objs)
    print(f"\nExtracted {len(all_vocab)} vocab objects from all lines.")
    # Aggregate and build units
    top_50_originals, original_to_translations, translation_to_originals = aggregate_vocab_objects(all_vocab)
    primary, secondary, _ = build_units_of_meaning(original_to_translations, translation_to_originals, TARGET_LANG_CODE, top_50_originals)
    # Build RemoteSet
    task = {
        "language": TARGET_LANG_CODE,
        "content": f"Watch & try to understand the video <https://www.youtube.com/watch?v={VIDEO_ID}>",
        "primaryUnitsOfMeaning": primary,
        "secondaryUnitsOfMeaning": secondary,
        "lastDownloadedAt": None,
        "lastPracticedAt": None,
        "isCompleted": False,
        "nextShownEarliestAt": "2024-01-01T00:00:00.000Z",
        "interval": 0,
        "attempts": []
    }
    remote_set = {
        "name": f"YouTube Vocabulary - {VIDEO_ID}",
        "language": TARGET_LANG_CODE,
        "tasks": [task]
    }
    # Save
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(remote_set, f, ensure_ascii=False, indent=2)
    print(f"\nRemoteSet saved to {OUTPUT_FILE}\nScript completed successfully!")

if __name__ == "__main__":
    main()
