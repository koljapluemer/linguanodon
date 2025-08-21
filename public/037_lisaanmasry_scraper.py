#!/usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FFOptions
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
import time
import re
import json
import os
from pathlib import Path

# Configuration
DEBUG_MODE = True  # Set to True to process only first 5 sentences
MAX_SENTENCES = 5 if DEBUG_MODE else 25
SLEEP_TIME = 1  # Sleep time between requests in seconds
WORD_CLICK_WAIT = 0.3  # Wait time after clicking a word

# Data storage
vocab_data = []
translation_data = []
note_data = []
link_data = []

# ID counters
vocab_id = 0
translation_id = 0
note_id = 0
link_id = 0

def get_next_vocab_id():
    global vocab_id
    vocab_id += 1
    return str(vocab_id)

def get_next_translation_id():
    global translation_id
    translation_id += 1
    return str(translation_id)

def get_next_note_id():
    global note_id
    note_id += 1
    return str(note_id)

def get_next_link_id():
    global link_id
    link_id += 1
    return str(link_id)

def setup_driver():
    options = FFOptions()
    options.add_argument('--headless')  # Run in headless mode
    try:
        # Use the geckodriver path we found
        service = Service(executable_path='/snap/bin/geckodriver')
        driver = webdriver.Firefox(service=service, options=options)
    except Exception as e:
        print(f"Error setting up Firefox driver: {e}")
        print("Make sure geckodriver is installed and in PATH")
        raise
    return driver

def wait_for_element(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )

def get_sentence_number(driver):
    try:
        td = wait_for_element(driver, By.XPATH, "//td[contains(text(), 'example')]")
        match = re.search(r'example (\d+) of', td.text)
        if match:
            return match.group(1)
    except (NoSuchElementException, TimeoutException):
        pass
    return None

def get_word_info(driver):
    try:
        # Get element type
        element_tr = wait_for_element(driver, By.XPATH, "//tr[contains(., 'Element:')]")
        word_base_type = element_tr.find_element(By.XPATH, ".//td[2]").text

        # Get language
        lang_tr = wait_for_element(driver, By.XPATH, "//tr[contains(., 'Language:')]")
        lang_td = lang_tr.find_element(By.XPATH, ".//td[2]").text
        word_lang = "arb" if lang_td == "MS" else "arz"

        return word_base_type, word_lang
    except (NoSuchElementException, TimeoutException):
        return None, None

def create_link(label, url, owner=None, owner_link=None, license=None):
    """Create a link entry and return its ID"""
    link_entry = {
        "id": get_next_link_id(),
        "label": label,
        "url": url
    }
    if owner:
        link_entry["owner"] = owner
    if owner_link:
        link_entry["ownerLink"] = owner_link
    if license:
        link_entry["license"] = license
    
    link_data.append(link_entry)
    return link_entry["id"]

def create_note(content, note_type=None, show_before_exercise=None):
    """Create a note entry and return its ID"""
    note_entry = {
        "id": get_next_note_id(),
        "content": content
    }
    if note_type:
        note_entry["noteType"] = note_type
    if show_before_exercise is not None:
        note_entry["showBeforeExercice"] = show_before_exercise
    
    note_data.append(note_entry)
    return note_entry["id"]

def create_translation(content, notes=None):
    """Create a translation entry and return its ID, or return existing ID if duplicate content"""
    # Check if translation with this content already exists
    for existing in translation_data:
        if existing["content"] == content:
            return existing["id"]
    
    # Create new translation
    translation_entry = {
        "id": get_next_translation_id(),
        "content": content
    }
    if notes:
        translation_entry["notes"] = notes
    
    translation_data.append(translation_entry)
    return translation_entry["id"]

def create_vocab(language, content, notes=None, translations=None, links=None, related_vocab=None):
    """Create a vocab entry and return its ID, or return existing ID if duplicate content+language"""
    # Check if vocab with this content+language already exists
    for existing in vocab_data:
        if existing["content"] == content and existing["language"] == language:
            # Update existing entry with new relationships
            if translations:
                if "translations" not in existing:
                    existing["translations"] = []
                for trans_id in translations:
                    if trans_id not in existing["translations"]:
                        existing["translations"].append(trans_id)
            
            if links:
                if "links" not in existing:
                    existing["links"] = []
                for link_id in links:
                    if link_id not in existing["links"]:
                        existing["links"].append(link_id)
            
            if related_vocab:
                if "relatedVocab" not in existing:
                    existing["relatedVocab"] = []
                for vocab_id in related_vocab:
                    if vocab_id not in existing["relatedVocab"]:
                        existing["relatedVocab"].append(vocab_id)
            
            if notes:
                if "notes" not in existing:
                    existing["notes"] = []
                for note_id in notes:
                    if note_id not in existing["notes"]:
                        existing["notes"].append(note_id)
            
            return existing["id"]
    
    # Create new vocab entry
    vocab_entry = {
        "id": get_next_vocab_id(),
        "language": language,
        "content": content
    }
    if notes:
        vocab_entry["notes"] = notes
    if translations:
        vocab_entry["translations"] = translations
    if links:
        vocab_entry["links"] = links
    if related_vocab:
        vocab_entry["relatedVocab"] = related_vocab
    
    vocab_data.append(vocab_entry)
    return vocab_entry["id"]

def process_sentence_data(driver):
    """Extract sentence data from the current page"""
    try:
        # Wait for the example div to be present
        example_div = wait_for_element(driver, By.ID, "example")
        
        # Find the Arabic sentence
        arz_p = example_div.find_element(By.CSS_SELECTOR, "p[class='ar']")
        sentence_arz = arz_p.text.strip()
        print(f'Found Arabic sentence: {sentence_arz}')

        # Find the transliteration
        transliteration_p = None
        for p in example_div.find_elements(By.TAG_NAME, "p"):
            if 'Individual words:' in p.text:
                transliteration_p = p
                break
        
        sentence_transliteration = ""
        if transliteration_p:
            sentence_transliteration = transliteration_p.text.replace('Individual words:', '').strip()
            print(f'Found transliteration: {sentence_transliteration}')

        # Find the English translation
        try:
            translation_h3 = example_div.find_element(By.XPATH, ".//h3[text()='Translation']")
            sentence_en = translation_h3.find_element(By.XPATH, "following-sibling::p[1]").text.strip()
            print(f'Found English translation: {sentence_en}')
        except NoSuchElementException:
            print('Could not find translation heading')
            return None

        # Find sentence notes
        sentence_notes = ''
        try:
            notes_h3 = example_div.find_element(By.XPATH, ".//h3[text()='Notes']")
            notes_p = notes_h3.find_element(By.XPATH, "following-sibling::p[1]")
            sentence_notes = notes_p.text.strip()
        except NoSuchElementException:
            print('No notes found (this is optional)')

        return {
            'sentence_arz': sentence_arz,
            'sentence_transliteration': sentence_transliteration,
            'sentence_en': sentence_en,
            'sentence_notes': sentence_notes,
            'arz_p': arz_p
        }

    except (NoSuchElementException, TimeoutException) as e:
        print(f'Error extracting sentence data: {e}')
        return None

def process_word_forms_and_meanings(driver, word_lang, word_base_type):
    """Process word forms and meanings, return lists of form and meaning vocab IDs"""
    form_vocab_ids = []
    meaning_vocab_ids = []
    
    # Process word forms
    try:
        forms_table = wait_for_element(driver, By.XPATH, "//h1[text()='Forms']/following-sibling::table[1]")
        rows = forms_table.find_elements(By.TAG_NAME, "tr")
        
        for row in rows:
            try:
                td2 = row.find_element(By.XPATH, ".//td[2]")
                form_transliteration = td2.find_element(By.TAG_NAME, "b").text
                try:
                    form_type = td2.find_element(By.TAG_NAME, "i").text
                except NoSuchElementException:
                    form_type = ""
                
                td3 = row.find_element(By.XPATH, ".//td[3]")
                form_arabic = td3.text.strip()
                if not form_arabic or form_arabic == '-':
                    continue

                # Create pronunciation note
                notes = []
                if form_transliteration:
                    pronunciation_note_id = create_note(form_transliteration, "pronunciation")
                    notes.append(pronunciation_note_id)
                
                # Add linguistic type note
                if word_base_type:
                    linguistic_type_note_id = create_note(word_base_type, "linguistic type", True)
                    notes.append(linguistic_type_note_id)

                # Create link for this word form
                # Generate word URL based on the old scraper pattern
                word_url = f"https://eu.lisaanmasry.org/online/word.php?word={form_arabic}"
                link_id = create_link(
                    "www.lisaanmasry.org",
                    word_url,
                    "Mike Green",
                    "https://eu.lisaanmasry.org/info/en/copyright.html",
                    "Non-Commercial, Credit Required"
                )

                # Create vocab entry for this form
                type_info = f"{word_base_type} {form_type}".strip() if form_type else word_base_type
                vocab_id = create_vocab(
                    language=word_lang,
                    content=form_arabic,
                    notes=notes,
                    links=[link_id]
                )
                form_vocab_ids.append(vocab_id)
                
            except (NoSuchElementException, StaleElementReferenceException) as e:
                print(f'Error processing form row: {e}')
                continue

    except (NoSuchElementException, TimeoutException) as e:
        print(f'No forms table found: {e}')

    # Process word meanings
    try:
        meanings_table = wait_for_element(driver, By.XPATH, "//h1[text()='Meanings']/following-sibling::table[1]")
        rows = meanings_table.find_elements(By.TAG_NAME, "tr")
        
        for row in rows:
            try:
                td2 = row.find_element(By.XPATH, ".//td[2]")
                form_en = td2.find_element(By.TAG_NAME, "a").text
                
                try:
                    form_type = td2.find_element(By.TAG_NAME, "i").text
                except NoSuchElementException:
                    form_type = None
                
                # Get text between <a> and <i> if it exists
                form_note = None
                if form_type:
                    text_parts = td2.text.split(form_en)
                    if len(text_parts) > 1:
                        form_note = text_parts[1].split(form_type)[0].strip()

                # Create note for additional info if exists
                notes = []
                if form_note:
                    note_id = create_note(form_note)
                    notes.append(note_id)
                
                # Add linguistic type note from form_type
                if form_type:
                    linguistic_type_note_id = create_note(form_type, "linguistic type", True)
                    notes.append(linguistic_type_note_id)

                # Create translation entry
                translation_id = create_translation(form_en, notes if notes else None)

                # Create link for meaning (same as sentence link)
                link_id = create_link(
                    "www.lisaanmasry.org",
                    "https://eu.lisaanmasry.org/online/example.php",
                    "Mike Green", 
                    "https://eu.lisaanmasry.org/info/en/copyright.html",
                    "Non-Commercial, Credit Required"
                )

                # English meanings are translations, not vocab entries
                # Update the Arabic forms to reference this translation
                for form_vocab_id in form_vocab_ids:
                    for vocab_entry in vocab_data:
                        if vocab_entry["id"] == form_vocab_id:
                            if "translations" not in vocab_entry:
                                vocab_entry["translations"] = []
                            vocab_entry["translations"].append(translation_id)
                            break
                
            except (NoSuchElementException, StaleElementReferenceException) as e:
                print(f'Error processing meaning row: {e}')
                continue

    except (NoSuchElementException, TimeoutException) as e:
        print(f'No meanings table found: {e}')

    return form_vocab_ids, []  # No meaning vocab IDs since English meanings are translations

def process_individual_words(driver, arz_p, sentence_vocab_id):
    """Process individual words in the sentence"""
    word_spans = arz_p.find_elements(By.TAG_NAME, "span")
    print(f'Found {len(word_spans)} word spans')
    
    word_vocab_ids = []
    
    for i in range(len(word_spans)):
        try:
            # Get fresh reference to the paragraph and spans
            example_div = wait_for_element(driver, By.ID, "example")
            arz_p = example_div.find_element(By.CSS_SELECTOR, "p[class='ar']")
            spans = arz_p.find_elements(By.TAG_NAME, "span")
            if i >= len(spans):
                continue
                
            span = spans[i]
            word_text = span.text
            print(f'Processing word {i+1} of {len(word_spans)}: {word_text}')
            
            # Click the span and wait for word details
            span.click()
            time.sleep(WORD_CLICK_WAIT)
            
            try:
                wait_for_element(driver, By.ID, "word")
            except TimeoutException:
                print(f'Timeout waiting for word details for word {i+1}')
                continue
            
            word_base_type, word_lang = get_word_info(driver)
            if not word_base_type or not word_lang:
                continue

            # Process forms and meanings for this word
            form_vocab_ids, _ = process_word_forms_and_meanings(driver, word_lang, word_base_type)
            
            # Add only form vocab IDs to the word list (meanings are translations)
            word_vocab_ids.extend(form_vocab_ids)
                
        except Exception as e:
            print(f'Error processing word {i+1}: {e}')
            continue

    # Update sentence vocab to reference all words
    if word_vocab_ids:
        for vocab_entry in vocab_data:
            if vocab_entry["id"] == sentence_vocab_id:
                vocab_entry["relatedVocab"] = word_vocab_ids
                break

    return word_vocab_ids

def scrape_sentence(driver, url):
    """Scrape a single sentence and create all related data entries"""
    try:
        driver.get(url)
        print('Page loaded, waiting for content...')
        
        # Process sentence data
        sentence_data = process_sentence_data(driver)
        if not sentence_data:
            return False

        # Create shared link for sentences
        sentence_link_id = create_link(
            "www.lisaanmasry.org",
            "https://eu.lisaanmasry.org/online/example.php",
            "Mike Green",
            "https://eu.lisaanmasry.org/info/en/copyright.html",
            "Non-Commercial, Credit Required"
        )

        # Create notes for sentence if needed
        sentence_notes = []
        if sentence_data['sentence_transliteration']:
            pronunciation_note_id = create_note(sentence_data['sentence_transliteration'], "pronunciation")
            sentence_notes.append(pronunciation_note_id)
        
        if sentence_data['sentence_notes']:
            general_note_id = create_note(sentence_data['sentence_notes'])
            sentence_notes.append(general_note_id)

        # Create translation for the sentence
        sentence_translation_id = create_translation(sentence_data['sentence_en'])

        # Create vocab entry for Arabic sentence
        sentence_vocab_id = create_vocab(
            language="arz",
            content=sentence_data['sentence_arz'],
            notes=sentence_notes if sentence_notes else None,
            translations=[sentence_translation_id],
            links=[sentence_link_id]
        )

        # English sentence is already created as a translation above, not as a vocab entry

        # Process individual words
        word_vocab_ids = process_individual_words(driver, sentence_data['arz_p'], sentence_vocab_id)

        print(f'Successfully processed sentence: {sentence_data["sentence_arz"]}')
        return True

    except Exception as e:
        print(f'Error scraping sentence: {e}')
        return False

def save_jsonl_files():
    """Save all collected data to JSONL files"""
    # Create directory structure
    output_dir = Path("sets/arz/lisaanmasry-examples")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save vocab.jsonl
    with open(output_dir / "vocab.jsonl", "w", encoding="utf-8") as f:
        for entry in vocab_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    # Save translations.jsonl
    with open(output_dir / "translations.jsonl", "w", encoding="utf-8") as f:
        for entry in translation_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    # Save notes.jsonl
    with open(output_dir / "notes.jsonl", "w", encoding="utf-8") as f:
        for entry in note_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    # Save links.jsonl
    with open(output_dir / "links.jsonl", "w", encoding="utf-8") as f:
        for entry in link_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    print(f"Saved {len(vocab_data)} vocab entries")
    print(f"Saved {len(translation_data)} translation entries")
    print(f"Saved {len(note_data)} note entries")
    print(f"Saved {len(link_data)} link entries")

def main():
    print(f"Starting Lisaan Masry scraper (DEBUG_MODE: {DEBUG_MODE})")
    print(f"Will process up to {MAX_SENTENCES} sentences")
    
    base_url = "https://eu.lisaanmasry.org/online/example.php"
    sentences_processed = 0

    driver = setup_driver()
    try:
        while sentences_processed < MAX_SENTENCES:
            print(f'Scraping sentence {sentences_processed + 1} of {MAX_SENTENCES}...')
            
            success = scrape_sentence(driver, base_url)
            if not success:
                print('Failed to scrape sentence, stopping...')
                break

            sentences_processed += 1
            if sentences_processed < MAX_SENTENCES:
                print(f'Sleeping for {SLEEP_TIME} seconds before next request...')
                time.sleep(SLEEP_TIME)
                
    finally:
        driver.quit()

    # Save all data to JSONL files
    save_jsonl_files()
    print(f"Scraping completed! Processed {sentences_processed} sentences")

if __name__ == "__main__":
    main()