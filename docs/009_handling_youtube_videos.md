# Handling Youtube Video Data

We want to use youtube videos (and their subtitles) to source learning data.

First, we use a subtitle downloader library like this

```py

from youtube_transcript_api import YouTubeTranscriptApi

# Configuration
OUTPUT_FILE = "demo.txt"
VIDEO_ID = "SqtKbzl5lrA"

# Get the list of available transcripts
transcript_list = YouTubeTranscriptApi.list_transcripts(VIDEO_ID)

# Select the first available transcript
first_transcript = next(iter(transcript_list))

# Fetch the transcript (returns a list of dicts)
transcript = first_transcript.fetch()

# Save transcript as plaintext (one line per entry)
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    for entry in transcript:
        f.write(entry.text + "\n")

print(f"Transcript saved to {OUTPUT_FILE} (language: {first_transcript.language_code})")

```

In our script, we set two consts:

```
VIDEO_SUBTITLE_LANGUAGE = "ar"
TARGET_LANG_CODE = "apc"
```

(Youtube categorizes languags differently, thus this is needed. The Video Subtitle Language is the target lang for the downlaoded, while the TARGET_LANG_CODE will be utilized for our output)

We then get the subtitles of the video in question, separated into sections, line by line. For example:

```
عم فكر اتزوج ويصير عندي عائله بس قبل بدي
اتاكد اذا رح استحق يصير عندي اولاد مشان
هيك جبت هدا الولد زدته بالهواء واتشقلب
وحاول اكمش لحتى اشوف اذا بيطلع والد جي ف
باول محاوله ز تيته وقع على الارض بس عاد
```

Then, we take *each line as a whole*, and feed that into the OpenAI API to extract vocabulary, using the prompt:

```
You are an expert in language teaching.

Extract language learning vocabulary from the following subtitle snippets in {source_language_code} language. 

Guidelines:
- Extract meaningful words and phrases that would be useful for language learners
- Ignore music indicators like [موسيقى] or [music]
- Extract even single words if they are meaningful vocabulary
- Ignore proper nouns (names, places, brands), exclamations (oh, wow), and non-translatable words
- For each extracted word/phrase, provide an English translation suitable for learning
- Retain correct capitalization and spelling
- Focus on common, everyday vocabulary that learners would encounter
- Even if snippets are short, extract any meaningful vocabulary
- Make sure that extracted 
- Only add the *pure* words/expressions themselves. Do not add notes or extra infos.

Return your answer as a JSON array with objects containing "word" and "translation" fields.

Subtitle snippet to analyze:
{subtitle_text}

```

We force the AI to produce a JSON output like this

```ts
interface VocabObject = {
    original: string // the extracted word or expression
    translation: string // the english translation
}
type ReturnObject = VocabObject[]

```

After this ran for the all subtitle lines, we have a big list of VocabObject.

We then, from this list, find the 50 most common vocab objects, and we make two lists: One with those 50 most common vocab objects (reduced to a set) and one with all other vocab objects in the video (also reduced to a set, w/o duplicated).

We then generate our output, which is to be of type [RemoteSet](../src/utils/backend/remoteSet.ts).

- There is only one [RemoteTask](../src/utils/backend/remoteSet.ts): language `TARGET_LANG_CODE` and content `"Watch & try to understand the video <https://www.youtube.com/watch?v=$video_id>"`.
- `primaryUnitsOfMeaning` is the list with 50 most common words, and `secondaryUnitsOfMeaning` is the list with the rest
- Note however, that we now represent the units of meaning as [RemoteUnitOfMeaning](../src/utils/backend/remoteSet.ts)
    - Most important difference: Both the translation and the original become *their own* unit objects. Here is an example:

For a `VocabObject` like this:

```json
{"original": "بس", "translation": "just"}
```


...we make:

```json

{
    "language": "$TARGET_LANG_CODE",
    "content": "بس",
    "translations": [{"language": "eng", "content": "just"}]
},
{
    "language": "eng",
    "content": "just",
    "translations": [{"language": "$TARGET_LANG_CODE", "content": "بس"}]
}

```

At the top of the file, allow setting the absolute output path for the generated json (just a dump of the generated `RemoteSet`)