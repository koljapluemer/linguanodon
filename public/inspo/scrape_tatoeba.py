#!/usr/bin/env python3
"""
Script to fetch English sentences with South Levantine Arabic (ajp) translations
from the Tatoeba API and generate a JSON file in the specified format.
"""

import requests
import json
import time
import logging
import urllib.parse
import re
from typing import Dict, List, Any

# Constants
SOURCE_LANGUAGE = 'eng'  # English
TARGET_LANGUAGE = 'apc'  
OUTPUT_FILEPATH = f'data/{SOURCE_LANGUAGE}_{TARGET_LANGUAGE}_sentences.json'  # <-- Set output file path here
DEBUG_ABORT_AFTER_FIRST_PAGE = False  # <-- Set to True to abort after first API call for debugging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api_responses.log', encoding='utf-8'),
        logging.StreamHandler()  # Also log to console
    ]
)
logger = logging.getLogger(__name__)

def fetch_sentences_with_ajp_translations() -> list:
    """
    Fetch {SOURCE_LANGUAGE} sentences that have {TARGET_LANGUAGE} translations.
    Returns:
        List of sentence pairs with {SOURCE_LANGUAGE} and {TARGET_LANGUAGE} translations
    """
    base_url = "https://api.tatoeba.org/unstable/sentences"
    all_sentences = []
    page_count = 0
    current_url = base_url
    params = {
        'lang': SOURCE_LANGUAGE,
        'trans:lang': TARGET_LANGUAGE,
        'sort': 'words',
        'limit': 20
    }
    after_value = None
    logger.info("=== Starting Tatoeba API requests ===")
    while True:
        page_count += 1
        logger.info(f"Fetching page {page_count}...")
        if page_count == 1:
            logger.debug(f"Request URL: {current_url}")
            logger.debug(f"Request params: {params}")
            response = requests.get(current_url, params=params)
        else:
            query = f"lang={SOURCE_LANGUAGE}&trans:lang={TARGET_LANGUAGE}&sort=words&limit=20&after={after_value}"
            full_url = f"{base_url}?{query}"
            logger.debug(f"Request URL: {full_url}")
            logger.debug(f"Request params: None (manual URL)")
            response = requests.get(full_url)
        response.raise_for_status()
        data = response.json()
        logger.debug(f"Response data: {json.dumps(data, indent=2, ensure_ascii=False)}")
        sentences = data.get('data', [])
        logger.info(f"Page {page_count}: fetched {len(sentences)} sentences")
        all_sentences.extend(sentences)
        if DEBUG_ABORT_AFTER_FIRST_PAGE:
            logger.info("DEBUG: Aborting after first API call as requested.")
            break
        paging = data.get('paging', {})
        next_url = paging.get('next')
        logger.info(f"Next URL: {next_url}")
        if not next_url or len(sentences) == 0:
            logger.info(f"No more pages available. Total sentences fetched: {len(all_sentences)}")
            break
        import re, urllib.parse
        match = re.search(r'after=([^&]+)', next_url)
        if match:
            after_value = urllib.parse.unquote(match.group(1))
            logger.info(f"Next page will use after={after_value}")
        else:
            logger.error("Could not extract 'after' value from next_url. Stopping pagination.")
            break
        logger.info("Sleeping 1 second before next page...")
        time.sleep(1)
        current_url = base_url
    logger.info(f"Successfully fetched {len(all_sentences)} sentence pairs total")
    return all_sentences

def make_simple_json(sentences: list) -> list:
    """
    Create a simple JSON array as described in the user request.
    """
    result = []
    for sent in sentences:
        src = {
            'text': sent.get('text', ''),
            'license': sent.get('license'),
            'owner': sent.get('owner'),
            'ownerLink': f"https://tatoeba.org/en/user/profile/{sent.get('owner')}" if sent.get('owner') else None,
            'source': 'tatoeba',
            'sourceLink': f"https://tatoeba.org/en/sentences/show/{sent.get('id')}" if sent.get('id') else None
        }
        tgt = None
        translations = sent.get('translations', [])
        for translation_group in translations:
            for translation in translation_group:
                if translation.get('lang') == TARGET_LANGUAGE:
                    tgt = {
                        'text': translation.get('text', ''),
                        'license': translation.get('license'),
                        'owner': translation.get('owner'),
                        'ownerLink': f"https://tatoeba.org/en/user/profile/{translation.get('owner')}" if translation.get('owner') else None,
                        'source': 'tatoeba',
                        'sourceLink': f"https://tatoeba.org/en/sentences/show/{translation.get('id')}" if translation.get('id') else None
                    }
                    break
            if tgt:
                break
        if tgt:
            result.append({SOURCE_LANGUAGE: src, TARGET_LANGUAGE: tgt})
    return result

def main():
    """Main function to fetch data and generate JSON file."""
    sentences = fetch_sentences_with_ajp_translations()
    if not sentences:
        logger.error("No sentences fetched. Exiting.")
        return
    simple_json = make_simple_json(sentences)
    try:
        with open(OUTPUT_FILEPATH, 'w', encoding='utf-8') as f:
            json.dump(simple_json, f, ensure_ascii=False, indent=2)
        logger.info(f"Successfully generated {OUTPUT_FILEPATH}")
        logger.info(f"Created {len(simple_json)} sentence pairs")
    except Exception as e:
        logger.error(f"Error saving file: {e}")

if __name__ == "__main__":
    main()
