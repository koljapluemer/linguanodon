#!/usr/bin/env python3
"""
Generalized script to generate vocabulary with images and sound for multiple languages.
Creates JSONL files with vocab, translations, notes, and links for Linguanodon.
Reuses existing images from the Mandarin set.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import deepl
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configuration
DEBUG = False  # Set to True to process only first two words
SOURCE_LANGUAGE = "eng"  # English (ISO 639-3)
SLEEP_BETWEEN_REQUESTS = 1
MAX_RETRIES = 3

# Language configurations
LANGUAGES = {
    "spa": {
        "name": "Spanish",
        "deepl_code": "ES",
        "iso_code": "spa"
    },
    "deu": {
        "name": "German", 
        "deepl_code": "DE",
        "iso_code": "deu"
    }
}

# Path to existing images (from Mandarin set)
EXISTING_IMAGES_PATH = Path("sets/cmn/basic-vocab-with-images-and-sound/images")

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('vocab_generation_generalized.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API clients
deepl_client = None
openai_client = None

# Word list (same as original)
WORDS = [
    "the apple", "the banana", "the orange", "the grape", "the watermelon", "the strawberry", "the lemon", "the peach", "the pear", "the pineapple",
    "the dog", "the cat", "the horse", "the cow", "the sheep", "the pig", "the chicken", "the duck", "the goose", "the rabbit",
    "the car", "the bus", "the bicycle", "the motorcycle", "the truck", "the train", "the boat", "the ship", "the airplane", "the helicopter",
    "the table", "the chair", "the bed", "the sofa", "the desk", "the lamp", "the door", "the window", "the cup", "the plate",
    "the house", "the apartment", "the school", "the hospital", "the store", "the restaurant", "the bridge", "the road", "the park", "the garden",
    "the tree", "the flower", "the grass", "the leaf", "the mountain", "the river", "the lake", "the sea", "the beach", "the island",
    "the sun", "the moon", "the star", "the cloud", "the rain", "the snow", "the wind", "the fire", "the ice", "the stone",
    "the man", "the woman", "the boy", "the girl", "the baby", "the teacher", "the doctor", "the farmer", "the police", "the chef",
    "the book", "the pen", "the pencil", "the paper", "the notebook", "the bag", "the phone", "the computer", "the clock", "the watch",
    "the shirt", "the pants", "the dress", "the skirt", "the shoes", "the hat", "the coat", "the socks", "the belt", "the gloves",
    "the bread", "the rice", "the egg", "the cheese", "the meat", "the fish", "the milk", "the butter", "the soup", "the cake",
    "the salt", "the sugar", "the pepper", "the oil", "the water", "the tea", "the coffee", "the juice", "the sandwich", "the pizza",
    "the ball", "the kite", "the doll", "the toy", "the bottle", "the box", "the bag", "the key", "the knife", "the fork",
    "the spoon", "the mirror", "the soap", "the brush", "the toothbrush", "the toothpaste", "the comb", "the towel", "the bucket", "the rope",
    "running", "walking", "jumping", "sitting", "standing", "sleeping", "eating", "drinking", "reading", "writing",
    "opening", "closing", "pushing", "pulling", "throwing", "catching", "climbing", "swimming", "driving", "riding",
    "singing", "dancing", "drawing", "painting", "cooking", "cleaning", "washing", "cutting", "building", "playing",
    "smiling", "crying", "laughing", "talking", "listening", "watching", "looking", "pointing", "waving", "carrying",
    "buying", "selling", "paying", "finding", "holding", "picking", "dropping", "helping", "sending", "calling",
    "digging", "planting", "watering", "feeding", "hunting", "fishing", "baking", "mixing", "fixing", "driving",
    "jumping", "kicking", "hitting", "throwing", "catching", "hugging", "kissing", "shaking", "turning", "stopping"
]

class LanguageProcessor:
    """Handles vocabulary generation for a specific language"""
    
    def __init__(self, language_code: str, language_config: Dict):
        self.language_code = language_code
        self.language_config = language_config
        self.output_dir = Path(f"sets/{language_code}/basic-vocab-with-images-and-sound")
        
        # Data storage
        self.vocab_data = []
        self.translation_data = []
        self.note_data = []
        self.link_data = []
        
        # ID counters
        self.vocab_id = 0
        self.translation_id = 0
        self.note_id = 0
        self.link_id = 0
        
        # Shared Pexels link ID
        self.shared_pexels_link_id = None
        
    def get_next_vocab_id(self):
        self.vocab_id += 1
        return str(self.vocab_id)

    def get_next_translation_id(self):
        self.translation_id += 1
        return str(self.translation_id)

    def get_next_note_id(self):
        self.note_id += 1
        return str(self.note_id)

    def get_next_link_id(self):
        self.link_id += 1
        return str(self.link_id)

    def create_link(self, label: str, url: str, owner: Optional[str] = None, 
                   owner_link: Optional[str] = None, license: Optional[str] = None) -> str:
        """Create a link entry and return its ID"""
        link_entry = {
            "id": self.get_next_link_id(),
            "label": label,
            "url": url
        }
        if owner:
            link_entry["owner"] = owner
        if owner_link:
            link_entry["ownerLink"] = owner_link
        if license:
            link_entry["license"] = license
        
        self.link_data.append(link_entry)
        return link_entry["id"]

    def create_translation(self, content: str, notes: Optional[List[str]] = None) -> str:
        """Create a translation entry and return its ID"""
        translation_entry = {
            "id": self.get_next_translation_id(),
            "content": content
        }
        if notes:
            translation_entry["notes"] = notes
        
        self.translation_data.append(translation_entry)
        return translation_entry["id"]

    def create_vocab(self, language: str, content: str, considered_character: Optional[bool] = None, 
                    considered_sentence: Optional[bool] = None, considered_word: Optional[bool] = None,
                    notes: Optional[List[str]] = None, translations: Optional[List[str]] = None, 
                    links: Optional[List[str]] = None, images: Optional[List[Dict]] = None, 
                    sounds: Optional[List[Dict]] = None, is_picturable: Optional[bool] = None) -> str:
        """Create a vocab entry and return its ID"""
        vocab_entry = {
            "id": self.get_next_vocab_id(),
            "language": language,
            "content": content
        }
        if considered_character is not None:
            vocab_entry["consideredCharacter"] = considered_character
        if considered_sentence is not None:
            vocab_entry["consideredSentence"] = considered_sentence
        if considered_word is not None:
            vocab_entry["consideredWord"] = considered_word
        if notes:
            vocab_entry["notes"] = notes
        if translations:
            vocab_entry["translations"] = translations
        if links:
            vocab_entry["links"] = links
        if images:
            vocab_entry["images"] = images
        if sounds:
            vocab_entry["sounds"] = sounds
        if is_picturable is not None:
            vocab_entry["isPicturable"] = is_picturable
        
        self.vocab_data.append(vocab_entry)
        return vocab_entry["id"]

    def clean_word_for_search(self, word: str) -> str:
        """Remove 'the ' article and clean word for image search"""
        cleaned = word.lower()
        if cleaned.startswith("the "):
            cleaned = cleaned[4:]
        return cleaned

    def translate_with_deepl(self, text: str, timeout: int = 30) -> Optional[Dict[str, str]]:
        """Translate text to target language using DeepL"""
        try:
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError(f"DeepL translation timed out after {timeout} seconds")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(timeout)
            
            try:
                result = deepl_client.translate_text(text, target_lang=self.language_config["deepl_code"])
                signal.alarm(0)  # Cancel alarm
                return {
                    "text": result.text,
                    "detected_source_lang": result.detected_source_lang
                }
            finally:
                signal.alarm(0)  # Ensure alarm is cancelled
                
        except Exception as e:
            logger.warning(f"DeepL translation failed for '{text}' to {self.language_config['name']}: {e}")
            return None

    def generate_audio_with_openai(self, text: str, filename: str) -> bool:
        """Generate audio using OpenAI TTS"""
        # Check if file already exists
        audio_dir = self.output_dir / "audio"
        audio_path = audio_dir / filename
        if audio_path.exists():
            logger.info(f"Audio already exists for '{text}': {filename}")
            return True
        
        try:
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError(f"OpenAI TTS timed out after 60 seconds")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(60)  # TTS can take longer than other APIs
            
            try:
                # Use appropriate voice for language
                voice = "alloy"  # Works well for most languages
                
                response = openai_client.audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=text,
                    response_format="opus"  # More efficient than MP3, better for web
                )
                signal.alarm(0)  # Cancel alarm
            finally:
                signal.alarm(0)  # Ensure alarm is cancelled
            
            # Save audio
            audio_dir.mkdir(parents=True, exist_ok=True)
            
            response.stream_to_file(audio_path)
            
            logger.info(f"Generated audio for '{text}' ({self.language_config['name']})")
            return True
            
        except Exception as e:
            logger.warning(f"Failed to generate audio for '{text}' ({self.language_config['name']}): {e}")
            return False

    def check_image_exists(self, english_word: str) -> Optional[str]:
        """Check if image exists for the given word and return filename"""
        search_term = self.clean_word_for_search(english_word)
        image_filename = f"{search_term}.jpg"
        image_path = EXISTING_IMAGES_PATH / image_filename
        
        if image_path.exists():
            return image_filename
        else:
            logger.warning(f"No existing image found for '{english_word}' (looking for {image_filename})")
            return None

    def process_word(self, english_word: str) -> bool:
        """Process a single word: translate, check for image, generate audio, create data entries"""
        logger.info(f"Processing word '{english_word}' for {self.language_config['name']}")
        
        # Check if image exists - skip word if no image
        image_filename = self.check_image_exists(english_word)
        if not image_filename:
            logger.warning(f"Skipping '{english_word}' for {self.language_config['name']} - no fitting image exists")
            return False
        
        # Translate to target language
        translation_result = self.translate_with_deepl(english_word)
        if not translation_result:
            logger.warning(f"Skipping '{english_word}' for {self.language_config['name']} - translation failed")
            return False
        
        target_word = translation_result["text"]
        logger.info(f"Translated '{english_word}' to '{target_word}' ({self.language_config['name']})")
        
        # Generate audio filename
        audio_filename = f"{target_word}.opus"
        
        # Generate audio
        audio_success = self.generate_audio_with_openai(target_word, audio_filename)
        
        # Create English translation
        english_translation_id = self.create_translation(english_word)
        
        # Prepare vocab entry data
        search_term = self.clean_word_for_search(english_word)
        images_list = [{
            "filename": image_filename,
            "alt": f"Image of {search_term}"
        }]
        
        sounds_list = []
        if audio_success:
            sounds_list.append({
                "filename": audio_filename
            })
        
        links = [self.shared_pexels_link_id]
        
        # Create vocab entry
        vocab_id = self.create_vocab(
            language=self.language_code,
            content=target_word,
            considered_word=True,  # These are individual words/phrases
            translations=[english_translation_id],
            links=links,
            images=images_list,
            sounds=sounds_list if sounds_list else None,
            is_picturable=True  # We only process words with images
        )
        
        logger.info(f"Successfully processed '{english_word}' -> '{target_word}' ({self.language_config['name']})")
        return True

    def initialize(self):
        """Initialize the processor by creating shared Pexels link"""
        self.shared_pexels_link_id = self.create_link(
            "Pexels",
            "https://pexels.com",
            None,
            None,
            "Pexels License"
        )
        logger.info(f"Created shared Pexels attribution link for {self.language_config['name']}")

    def save_jsonl_files(self):
        """Save all collected data to JSONL files"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save vocab.jsonl
        if self.vocab_data:
            with open(self.output_dir / "vocab.jsonl", "w", encoding="utf-8") as f:
                for entry in self.vocab_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        
        # Save translations.jsonl
        if self.translation_data:
            with open(self.output_dir / "translations.jsonl", "w", encoding="utf-8") as f:
                for entry in self.translation_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        
        # Save notes.jsonl
        if self.note_data:
            with open(self.output_dir / "notes.jsonl", "w", encoding="utf-8") as f:
                for entry in self.note_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        
        # Save links.jsonl
        if self.link_data:
            with open(self.output_dir / "links.jsonl", "w", encoding="utf-8") as f:
                for entry in self.link_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        
        logger.info(f"Saved {len(self.vocab_data)} vocab entries for {self.language_config['name']}")
        logger.info(f"Saved {len(self.translation_data)} translation entries for {self.language_config['name']}")
        logger.info(f"Saved {len(self.note_data)} note entries for {self.language_config['name']}")
        logger.info(f"Saved {len(self.link_data)} link entries for {self.language_config['name']}")
        logger.info(f"Files saved to: {self.output_dir}")

def setup_apis():
    """Initialize API clients with environment variables"""
    global deepl_client, openai_client
    
    # DeepL
    deepl_key = os.getenv('DEEPL_API_KEY')
    if not deepl_key:
        raise ValueError("DEEPL_API_KEY not found in environment variables")
    deepl_client = deepl.Translator(deepl_key)
    
    # OpenAI
    openai_key = os.getenv('OPENAI_API_KEY')
    if not openai_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    openai_client = OpenAI(api_key=openai_key)
    
    logger.info("API clients initialized successfully")

def main():
    """Main function to process all words for all languages"""
    try:
        logger.info("Starting generalized vocabulary generation with images and sound")
        
        # Check if existing images directory exists
        if not EXISTING_IMAGES_PATH.exists():
            raise FileNotFoundError(f"Existing images directory not found: {EXISTING_IMAGES_PATH}")
        
        logger.info(f"Using existing images from: {EXISTING_IMAGES_PATH}")
        
        # Setup API clients
        setup_apis()
        
        # Process words for each language
        words_to_process = WORDS[:2] if DEBUG else WORDS
        
        for language_code, language_config in LANGUAGES.items():
            logger.info(f"\n=== Processing {language_config['name']} ({language_code}) ===")
            
            # Initialize processor for this language
            processor = LanguageProcessor(language_code, language_config)
            processor.initialize()
            
            successful_words = 0
            
            for i, word in enumerate(words_to_process):
                logger.info(f"Processing word {i+1}/{len(words_to_process)} for {language_config['name']}: {word}")
                
                if processor.process_word(word):
                    successful_words += 1
                
                # Sleep between requests to be respectful to APIs
                if i < len(words_to_process) - 1:
                    time.sleep(SLEEP_BETWEEN_REQUESTS)
            
            # Save all data to files for this language
            processor.save_jsonl_files()
            
            logger.info(f"Completed {language_config['name']}! Successfully processed {successful_words}/{len(words_to_process)} words")
        
        logger.info(f"\n=== All languages completed! ===")
        if DEBUG:
            logger.info("DEBUG mode was enabled - only processed first 2 words per language")
            
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main()