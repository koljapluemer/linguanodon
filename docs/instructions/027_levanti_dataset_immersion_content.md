Build [this script](public/002_levanti_dataset_sentences_as_immersion_content.py)

Based on [this dataset](public/data_in/usable_sentences_with_vocab.json), it should create a [RemoteImmersionContentSet](src/shared/types/RemoteImmersionContentData.ts).


You can expect the data to be in this format:

```json
[
  {
    "apc": "انا حابب احكي معك.",
    "eng": "I want to talk to you.",
    "vocab": [
      {
        "apc": "حابب",
        "eng": "want"
      },
      {
        "apc": "احكي",
        "eng": "talk"
      },
      {
        "apc": "معك",
        "eng": "to you"
      }
    ]
  }, {}, {}, // and so on
]
```

See the inspiration scripts [1](/home/brokkoli/GITHUB/linguanodon/public/inspo/13_conv_to_linguanodon_format.py) [2](public/inspo/14_conv_to_new_linguanodon_format.py) to understand how the conversion may be done, however note that these are legacy script aiming for an obsolete output format.

Output to `immersion_content_sets/apc`. Orient yourself [with this script](public/001_levantine_words.py). Don't forget to write/update an index file so this set is actually downloadable.