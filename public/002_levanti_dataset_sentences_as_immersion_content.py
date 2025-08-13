#!/usr/bin/env python3

import json
import os

def load_sentences_data():
    """Load the usable sentences data from JSON file"""
    input_file = "data_in/usable_sentences_with_vocab.json"
    
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def convert_to_remote_vocab(vocab_item):
    """Convert vocab item to RemoteVocab format"""
    return {
        "language": "apc",
        "priority": 1,
        "content": vocab_item["apc"],
        "translations": [{
            "content": vocab_item["eng"]
        }]
    }

def convert_to_remote_immersion_content(sentence_data, index):
    """Convert sentence data to RemoteImmersionContent format"""
    apc_sentence = sentence_data["apc"]
    eng_sentence = sentence_data["eng"]
    vocab_items = sentence_data.get("vocab", [])
    
    # Convert vocab items to RemoteVocab format
    needed_vocab = [convert_to_remote_vocab(vocab) for vocab in vocab_items]
    
    # Create the immersion content item
    return {
        "language": "apc",
        "priority": 1,
        "title": f"Levanti Sentence {index + 1}",
        "content": apc_sentence,
        "neededVocab": needed_vocab if needed_vocab else None,
        "notes": [{
            "content": f"English: {eng_sentence}",
            "showBeforeExercise": False
        }]
    }

def create_immersion_content_set(sentences_data):
    """Create RemoteImmersionContentSet from sentences data"""
    immersion_content = []
    
    for i, sentence_data in enumerate(sentences_data):
        content_item = convert_to_remote_immersion_content(sentence_data, i)
        # Remove None values to keep JSON clean
        if content_item.get("neededVocab") is None:
            del content_item["neededVocab"]
        immersion_content.append(content_item)
    
    return {
        "name": "Levanti Dataset Sentences",
        "immersionContent": immersion_content
    }

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
    """Main function to convert Levanti dataset to immersion content format"""
    print("Converting Levanti dataset to RemoteImmersionContentSet format...")
    
    try:
        # Load input data
        sentences_data = load_sentences_data()
        print(f"Loaded {len(sentences_data)} sentences from dataset")
        
        # Convert to RemoteImmersionContentSet format
        immersion_content_set = create_immersion_content_set(sentences_data)
        print(f"Converted to {len(immersion_content_set['immersionContent'])} immersion content items")
        
        # Ensure output directory exists
        output_dir = "immersion_content_sets/apc"
        ensure_directory_exists(output_dir)
        
        # Write output file
        output_filename = "levanti_sentences"
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