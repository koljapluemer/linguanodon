import os
import json
import random
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

# =====================
# CONFIGURATION
# =====================
DATA_PATH = '/home/brokkoli/GITHUB/linguanodon/backend/data/'
LEVANTI_CSV = '/home/brokkoli/GITHUB/linguanodon/backend/scripts/001_handle_shamy_dataset/levanti_filtered_3cols.csv'
SENTENCE_COUNT = 10  # Number of sentences to process
MIN_WORDS = 3
MAX_WORDS = 6
os.makedirs(DATA_PATH, exist_ok=True)

# =====================
# OPENAI SETUP
# =====================
load_dotenv()
def get_openai_client():
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY environment variable is required')
    return OpenAI(api_key=api_key)

client = get_openai_client()

# =====================
# LOAD DATASET
# =====================
df = pd.read_csv(LEVANTI_CSV)
df = df[df['arabic'].notna() & df['english'].notna()]
df['arabic_word_count'] = df['arabic'].apply(lambda x: len(str(x).split()))
df = df[(df['arabic_word_count'] >= MIN_WORDS) & (df['arabic_word_count'] <= MAX_WORDS)]

if len(df) < SENTENCE_COUNT:
    raise ValueError(f"Not enough sentences in dataset: found {len(df)}, need {SENTENCE_COUNT}")

selected_rows = df.sample(n=SENTENCE_COUNT, random_state=None)

# =====================
# OPENAI VOCAB EXTRACTION
# =====================
def extract_vocab_from_sentence(arabic: str, english: str, client: OpenAI):
    prompt = f"""You are an expert in language teaching.\n\nExtract language learning vocabulary from the following sentence in Levantine Arabic.\n\nGuidelines:\n- Extract meaningful words and phrases that would be useful for language learners\n- Ignore music indicators, exclamations, proper nouns, and non-translatable words\n- For each extracted word/phrase, provide the correct English translation (use the provided English sentence for reference)\n- Retain correct spelling\n- Only add the pure words/expressions themselves. Do not add notes or extra infos.\n- Return your answer as a JSON array with objects containing 'original' and 'translation' fields.\n\nArabic sentence:\n{arabic}\nEnglish sentence:\n{english}\n"""
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
        parsed = json.loads(content)
        if isinstance(parsed, list):
            return [v for v in parsed if v.get('original') and v.get('translation')]
        elif 'vocabulary' in parsed:
            return [v for v in parsed['vocabulary'] if v.get('original') and v.get('translation')]
        elif 'words' in parsed:
            return [v for v in parsed['words'] if v.get('original') and v.get('translation')]
        else:
            return []
    except Exception as e:
        print(f"Error extracting vocab for: {arabic}\n{e}")
        return []

# =====================
# GENERATE OUTPUTS
# =====================
for idx, row in selected_rows.iterrows():
    arabic = str(row['arabic'])
    english = str(row['english'])
    vocab = extract_vocab_from_sentence(arabic, english, client)
    if not vocab:
        print(f"Skipping sentence due to no vocab: {arabic}")
        continue
    # Build units of meaning
    primary = []
    secondary = []
    for v in vocab:
        ar_unit = {
            "language": "apc",
            "content": v['original'],
            "translations": [{"language": "eng", "content": v['translation']}]
        }
        en_unit = {
            "language": "eng",
            "content": v['translation'],
            "translations": [{"language": "apc", "content": v['original']}]
        }
        primary.append(ar_unit)
        primary.append(en_unit)
    # Output structure
    task = {
        "content": f"Translate the sentence '{arabic}'",
        "language": "apc",
        "primaryUnitsOfMeaning": primary,
        "secondaryUnitsOfMeaning": secondary
    }
    output = {
        "name": f"Translate: {arabic}",
        "language": "apc",
        "tasks": [task]
    }
    # File name: translate_sentence_$sentence_in_arabic.json (sanitize for FS)
    safe_arabic = ''.join(c if c.isalnum() else '_' for c in arabic)[:40]
    filename = f"translate_sentence_{safe_arabic}.json"
    out_path = os.path.join(DATA_PATH, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Wrote {out_path}")
