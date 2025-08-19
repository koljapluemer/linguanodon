#!/usr/bin/env python3
"""
Script to download YouTube subtitles and extract vocabulary using OpenAI.
Creates RemoteImmersionContentSet for language learning data.
"""

import os
import json
import sys
import uuid
from pathlib import Path
from typing import List, Dict, Any, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
from collections import Counter, defaultdict
import re

# Load environment variables from .env file
load_dotenv()

# Set the .txt file to use
VIDEO_LIST_TXT = "data_in/apc_ar.txt"  # Change as needed

# Debug option - set to True to process only first 2 videos for testing
RETURN_AFTER_TWO_VIDEOS = False

# Parse language codes from filename
filename = Path(VIDEO_LIST_TXT).stem  # e.g., 'apc_ar'
try:
    TARGET_LANG_CODE, VIDEO_SUBTITLE_LANGUAGE = filename.split("_")
except ValueError:
    print(f"Error: Could not parse language codes from filename '{VIDEO_LIST_TXT}'. Expected format '<target>_<subtitle>.txt'")
    sys.exit(1)

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
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id, languages=[lang_code])
        lines = [entry.text.strip() for entry in transcript if entry.text.strip()]
        print(f"Downloaded {len(lines)} subtitle lines (language: {lang_code})")
        return lines, lang_code
    except Exception as e:
        print(f"Error downloading subtitles: {e}")
        raise

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

def convert_to_remote_vocab(vocab_obj: VocabObject, target_lang_code: str) -> Dict:
    """Convert VocabObject to RemoteVocab format"""
    return {
        "language": target_lang_code,
        "priority": 1,
        "content": vocab_obj.original,
        "translations": [{
            "content": vocab_obj.translation
        }]
    }

def process_video(video_id: str, target_lang_code: str, subtitle_lang_code: str, client: OpenAI) -> Dict:
    print(f"Processing YouTube video: {video_id}")
    
    # Download subtitles
    print("Downloading subtitles...")
    lines, subtitle_lang_code_actual = download_subtitles(video_id, subtitle_lang_code)
    print("\n--- SUBTITLE DEBUG (first 3 lines) ---")
    for i, line in enumerate(lines[:3]):
        print(f"Line {i+1}: {line}")
    print("--- END SUBTITLE DEBUG ---\n")
    
    # Extract vocab for each line
    all_vocab = []
    for idx, line in enumerate(lines):
        print(f"\nProcessing line {idx+1}/{len(lines)}: {line}")
        vocab_objs = extract_vocab_from_line(line, subtitle_lang_code_actual, client)
        all_vocab.extend(vocab_objs)
    
    print(f"\nExtracted {len(all_vocab)} vocab objects from all lines.")
    
    # Aggregate vocabulary to avoid duplicates
    unique_vocab = {}
    for vocab_obj in all_vocab:
        key = (vocab_obj.original, vocab_obj.translation)
        if key not in unique_vocab:
            unique_vocab[key] = vocab_obj
    
    # Convert to RemoteVocab format
    needed_vocab = [convert_to_remote_vocab(vocab_obj, target_lang_code) 
                   for vocab_obj in unique_vocab.values()]
    
    # Create immersion content item in RemoteImmersionContent format
    immersion_content = {
        "language": target_lang_code,
        "priority": 1,
        "title": f"YouTube Video - {video_id}",
        "content": f"Watch this video: https://www.youtube.com/watch?v={video_id}",
        "neededVocab": needed_vocab if needed_vocab else None,
        "notes": [{
            "content": f"YouTube Video ID: {video_id}\nSubtitle language: {subtitle_lang_code_actual}",
            "showBeforeExercise": False
        }]
    }
    
    # Remove None values to keep JSON clean
    if immersion_content.get("neededVocab") is None:
        del immersion_content["neededVocab"]
    
    return immersion_content

def ensure_directory_exists(directory):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def update_index_file(directory, filename_without_extension):
    """Create or update index.json file in the directory"""
    index_file = os.path.join(directory, "index.json")
    
    # Load existing index or create new one
    if os.path.exists(index_file):
        with open(index_file, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
    else:
        index_data = []
    
    # Add new file if not already present
    if filename_without_extension not in index_data:
        index_data.append(filename_without_extension)
        
        # Write updated index
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)
        
        print(f"Updated index file: {index_file}")
    else:
        print(f"File already in index: {filename_without_extension}")

def main():
    print("Converting YouTube videos to RemoteImmersionContentSet format...")
    
    try:
        # Read video codes from file
        with open(VIDEO_LIST_TXT, "r", encoding="utf-8") as f:
            video_ids = [line.strip() for line in f if line.strip()]
        
        print(f"Loaded {len(video_ids)} video IDs from {VIDEO_LIST_TXT}")
        
        # Initialize output data structure
        all_immersion_content = []
        
        # Get OpenAI client
        client = get_openai_client()
        
        # Process each video
        for idx, video_id in enumerate(video_ids):
            print(f"\n[{idx+1}/{len(video_ids)}] Processing video: {video_id}")
            try:
                immersion_content = process_video(
                    video_id, TARGET_LANG_CODE, VIDEO_SUBTITLE_LANGUAGE, client
                )
                
                all_immersion_content.append(immersion_content)
                
            except Exception as e:
                print(f"Error processing video {video_id}: {e}\nSKIPPING this video.")
                continue
            
            # Debug: return after processing 2 videos
            if RETURN_AFTER_TWO_VIDEOS and idx >= 1:
                print(f"\nDEBUG: Returning after processing 2 videos as requested.")
                break
        
        # Create RemoteImmersionContentSet format
        immersion_content_set = {
            "name": f"YouTube Videos ({TARGET_LANG_CODE})",
            "immersionContent": all_immersion_content
        }
        
        print(f"Converted to {len(immersion_content_set['immersionContent'])} immersion content items")
        
        # Ensure output directory exists
        output_dir = f"immersion_content_sets/{TARGET_LANG_CODE}"
        ensure_directory_exists(output_dir)
        
        # Write output file
        output_filename = f"youtube_{TARGET_LANG_CODE}_{VIDEO_SUBTITLE_LANGUAGE}"
        output_file = os.path.join(output_dir, f"{output_filename}.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(immersion_content_set, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully wrote: {output_file}")
        print(f"Total immersion content items: {len(immersion_content_set['immersionContent'])}")
        
        # Update index file
        update_index_file(output_dir, output_filename)
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
