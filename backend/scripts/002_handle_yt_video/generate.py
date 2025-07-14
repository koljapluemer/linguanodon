#!/usr/bin/env python3
"""
Script to download YouTube subtitles and extract vocabulary using OpenAI.
Creates Set structure for language learning data.
"""

import os
import json
import sys
from typing import List, Dict, Any
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
from collections import Counter
import re

# Load environment variables from .env file
load_dotenv()

# Configuration
YOUTUBE_VIDEO_ID = "r4psGFKZQqQ"  # Replace with your video ID
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "data", "002_youtube_vocabulary.json")
LETTER_CODE = "apc"

def get_openai_client() -> OpenAI:
    """Initialize OpenAI client with API key from environment"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    return OpenAI(api_key=api_key)

def download_subtitles(video_id: str) -> str:
    """Download subtitles from YouTube video"""
    try:
        # Get transcript list to find available languages
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try to get transcript in the video's original language first
        # If that fails, fall back to any available transcript
        try:
            # Get the first available transcript (usually in the video's original language)
            transcript = next(iter(transcript_list))
            print(f"Found transcript in language: {transcript.language} ({transcript.language_code})")
        except StopIteration:
            # If no transcripts available, try to find any transcript
            available_transcripts = list(transcript_list)
            if not available_transcripts:
                raise Exception("No transcripts available for this video")
            transcript = available_transcripts[0]
            print(f"Using available transcript in: {transcript.language} ({transcript.language_code})")
        
        # Fetch the transcript
        fetched_transcript = transcript.fetch()
        
        print(f"Downloaded transcript with {len(fetched_transcript)} snippets")
        print(f"Language: {transcript.language} ({transcript.language_code})")
        
        return fetched_transcript, transcript.language_code
        
    except Exception as e:
        print(f"Error downloading subtitles: {e}")
        sys.exit(1)

def extract_vocabulary(subtitle_snippets, source_language_code: str, client: OpenAI) -> List[Dict[str, str]]:
    """Extract vocabulary from subtitle snippets using OpenAI"""
    
    # Convert subtitle snippets to a format suitable for analysis
    subtitle_texts = [snippet.text for snippet in subtitle_snippets]
    
    # Generic prompt that works for any language
    prompt = f"""You are an expert in language learning and vocabulary extraction.

Extract language learning vocabulary from the following subtitle snippets in {source_language_code} language. 

Guidelines:
- Extract meaningful words and phrases that would be useful for language learners
- Ignore music indicators like [موسيقى] or [music]
- Extract even single words if they are meaningful vocabulary
- Ignore proper nouns (names, places, brands), exclamations (oh, wow), and non-translatable words
- For each extracted word/phrase, provide an English translation suitable for learning
- Retain correct capitalization and spelling
- If a word appears in declined, conjugated, or plural form, include both the occurring form and base form as separate entries
- Focus on common, everyday vocabulary that learners would encounter
- Even if snippets are short, extract any meaningful vocabulary

Return your answer as a JSON array with objects containing "word" and "translation" fields.

Subtitle snippets to analyze:
{subtitle_texts}

Output JSON:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant specialized in language learning and vocabulary extraction. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        content = response.choices[0].message.content
        print(f"OpenAI Response: {content}")
        parsed_response = json.loads(content)
        
        # Handle different possible response structures
        if "vocabulary" in parsed_response:
            return parsed_response["vocabulary"]
        elif "words" in parsed_response:
            return parsed_response["words"]
        elif isinstance(parsed_response, list):
            return parsed_response
        else:
            # If it's a flat object, try to extract word-translation pairs
            vocabulary = []
            for key, value in parsed_response.items():
                if isinstance(value, str):
                    vocabulary.append({"word": key, "translation": value})
            return vocabulary
            
    except Exception as e:
        print(f"Error extracting vocabulary: {e}")
        print(f"Response content: {content if 'content' in locals() else 'No content'}")
        sys.exit(1)

def create_set_structure(vocabulary: List[Dict[str, str]], subtitle_snippets, source_language_code: str, video_id: str) -> Dict[str, Any]:
    """Create Set structure with one task per video"""
    
    # Create primary units (all vocabulary words)
    primary_units = []
    for entry in vocabulary:
        primary_units.append({
            "language": LETTER_CODE,
            "content": entry["word"]
        })
        primary_units.append({
            "language": "eng",
            "content": entry["translation"]
        })
    
    # Create secondary units (empty for now, could be populated with additional context)
    secondary_units = []
    
    # Create the task
    task = {
        "language": LETTER_CODE,
        "content": f"Watch the video: https://www.youtube.com/watch?v={video_id}",
        "primaryUnitsOfMeaning": primary_units,
        "secondaryUnitsOfMeaning": secondary_units,
        "lastDownloadedAt": None,
        "lastPracticedAt": None,
        "isCompleted": False,
        "nextShownEarliestAt": "2024-01-01T00:00:00.000Z",
        "interval": 0,
        "attempts": []
    }
    
    # Create the Set structure
    set_data = {
        "name": f"YouTube Vocabulary - {video_id}",
        "language": LETTER_CODE,
        "tasks": [task]
    }
    
    return set_data

def save_to_file(data: Dict[str, Any], filename: str):
    """Save data to JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Set data saved to {filename}")
    except Exception as e:
        print(f"Error saving file: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print(f"Processing YouTube video: {YOUTUBE_VIDEO_ID}")
    
    # Initialize OpenAI client
    client = get_openai_client()
    
    # Download subtitles
    print("Downloading subtitles...")
    subtitle_snippets, language_code = download_subtitles(YOUTUBE_VIDEO_ID)
    
    # Debug: print the first few subtitle snippets
    print("\n--- SUBTITLE DEBUG (first 3 snippets) ---")
    for i, snippet in enumerate(subtitle_snippets[:3]):
        print(f"Snippet {i+1}: {snippet.text}")
    print("--- END SUBTITLE DEBUG ---\n")
    
    # Extract vocabulary using OpenAI
    print("Extracting vocabulary using OpenAI...")
    vocabulary = extract_vocabulary(subtitle_snippets, language_code, client)
    print(f"Extracted {len(vocabulary)} vocabulary entries")
    
    # Create Set structure
    print("Creating Set structure...")
    data = create_set_structure(vocabulary, subtitle_snippets, language_code, YOUTUBE_VIDEO_ID)
    
    # Save to file
    save_to_file(data, OUTPUT_FILE)
    
    print("Script completed successfully!")

if __name__ == "__main__":
    main()
