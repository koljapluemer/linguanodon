Let's generate a [remote set](src/pages/downloads/UnifiedRemoteSetService.ts) with [vocab](src/entities/vocab/vocab/VocabData.ts) that has sound and images.

The goal is to build out [THIS SCRIPT](public/006_vocab_with_img_and_sound_mandarin.py)

High level overview: loop the words, for each get a mandarin translation, the pronunciation of that, and an image (based on the english word)

- get images via the [pexels api](https://pypi.org/project/pexels-api-py/)
- remove "the " article from words before searching on pexels
- get env variables from `.env`
- As for the output, orient yourself on previous scripts such as [this](public/005_integrate_tatoeba_sentences.py) and [this](public/004_lisaanmasry_examples.py). Our target is of course [vocab schema](src/entities/remote-sets/validation/vocabSchema.ts) and [translation schema](src/entities/remote-sets/validation/translationSchema.ts). Each vocab should have a [link](src/shared/links/Link.ts) attached to pexels
- Make sure that the media files are stored in a way that the [service](src/pages/downloads/UnifiedRemoteSetService.ts) can read them in
- use DeepL api for the translation
- use speechgen.io for the tts-based texts
- add a DEBUG=true const at the top of file that if true stops proceedings after first two words


## Clarification Questions

1. **Language Configuration**: Should the script target Mandarin Chinese? What ISO code should be used (cmn, zh, zh-cn)?

Mandarin chinese, appropriate codes

2. **File Organization**: Should the output directory be `sets/{language}/vocab-with-media/` or a different naming convention?

let's call it basic-vocab-with-images-and-sound

3. **Image Selection**: When multiple images are returned from Pexels API, should we:
   - Take the first result?
   - Download multiple images per word?
   - Apply any filtering criteria (size, orientation, etc.)?

first

4. **Audio Generation**: For speechgen.io TTS:
   - What voice/accent should be used for Mandarin?
   - What audio format/quality settings are preferred?
   - Should we generate audio for both the Chinese word AND its pronunciation/pinyin?

any, just reasonable settings

5. **Error Handling**: How should the script handle:
   - Words that fail to translate via DeepL?
   - Words that return no suitable images on Pexels?
   - TTS generation failures?
   - API rate limits?

warn in stdout and skip word

6. **Batch Processing**: Should the script process all words in one run or support resumable batch processing like the Tatoeba script?

all in one is fine

7. **Link Attribution**: Should each vocab entry have individual links to the specific Pexels photo used, or just a general Pexels attribution link?

general pexels link

8. **Pronunciation Format**: Should pinyin be stored as:
   - A translation entry?
   - A note with type "pronunciation"?
   - Both?

do we get pinyin? if so, as a note with type "pinyin"

9. **Priority Scoring**: What priority values should be assigned to different types of words (nouns vs verbs vs actions)?

leave out priority. it's optional

10. **File Naming Convention**: For media files, should they be named by:
    - English word (e.g., "apple.jpg", "apple.mp3")?
    - Sequential numbering (e.g., "001.jpg", "001.mp3")?
    - Hash/UUID system?

english word for the images. mandarin word for the sound.