#!/usr/bin/env python3

import json
import re
from bs4 import BeautifulSoup
import os

def clean_text(text):
    """Clean text by stripping whitespace and handling empty strings"""
    return text.strip() if text else ""

def process_english_word(english_text):
    """Process English word: lowercase, handle slashes, extract parentheses"""
    if not english_text:
        return "", ""
    
    # Handle slashes - ignore everything after slash
    if '/' in english_text:
        english_text = english_text.split('/')[0].strip()
    
    # Extract parentheses content for notes
    note_content = ""
    parentheses_match = re.search(r'\(([^)]+)\)', english_text)
    if parentheses_match:
        note_content = parentheses_match.group(1).strip()
        # Remove parentheses and content from the main text
        english_text = re.sub(r'\s*\([^)]*\)', '', english_text).strip()
    
    # Convert to lowercase
    english_text = english_text.lower()
    
    return english_text, note_content

def process_arabic_word(arabic_text):
    """Process Arabic word: handle slashes"""
    if not arabic_text:
        return ""
    
    # Handle slashes - ignore everything after slash
    if '/' in arabic_text:
        arabic_text = arabic_text.split('/')[0].strip()
    
    return arabic_text.strip()

def extract_pronunciation(pronunciation_text):
    """Extract pronunciation from em tags"""
    if not pronunciation_text:
        return ""
    
    # Remove em tags and clean
    pronunciation = re.sub(r'<[^>]+>', '', pronunciation_text).strip()
    return pronunciation

def parse_html_table():
    """Parse the HTML table and extract vocabulary data"""
    html_file = "data_in/1000_common_levantine.html"
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the table
    table = soup.find('table')
    if not table:
        raise ValueError("No table found in HTML file")
    
    # Find all data rows (skip header)
    rows = table.find('tbody').find_all('tr')
    
    vocabs = []
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) != 3:
            continue
        
        english_cell = cells[0]
        arabic_cell = cells[1]
        pronunciation_cell = cells[2]
        
        # Extract text content
        english_raw = clean_text(english_cell.get_text())
        arabic_raw = clean_text(arabic_cell.get_text())
        pronunciation_raw = clean_text(pronunciation_cell.get_text())
        
        # Process the texts
        english_processed, english_note = process_english_word(english_raw)
        arabic_processed = process_arabic_word(arabic_raw)
        pronunciation_processed = extract_pronunciation(pronunciation_raw)
        
        if not english_processed or not arabic_processed:
            continue
        
        # Build the vocab object according to RemoteVocabData.ts interface
        vocab = {
            "language": "apc",
            "priority": 1,
            "content": arabic_processed,
            "translations": [{
                "content": english_processed,
                "notes": [{"content": english_note, "showBeforeExercise": True}] if english_note else None
            }],
            "notes": [{"content": pronunciation_processed, "showBeforeExercise": False}] if pronunciation_processed else None
        }
        
        # Clean up None values
        if vocab["translations"][0]["notes"] is None:
            del vocab["translations"][0]["notes"]
        if vocab["notes"] is None:
            del vocab["notes"]
        
        vocabs.append(vocab)
    
    return vocabs

def main():
    """Main function to parse HTML and create JSON output"""
    print("Parsing HTML table...")
    
    try:
        vocabs = parse_html_table()
        print(f"Extracted {len(vocabs)} vocabulary items")
        
        # Create the vocab set according to RemoteVocabData.ts interface
        vocab_set = {
            "name": "1000 Common Levantine Words",
            "vocabs": vocabs
        }
        
        # Ensure output directory exists
        os.makedirs("vocab_sets", exist_ok=True)
        
        # Write to JSON file
        output_file = "vocab_sets/1000_common_levantine.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(vocab_set, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully wrote {output_file}")
        print(f"Total vocabulary items: {len(vocabs)}")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())