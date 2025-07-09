# Set-Based Learning

The `setStore` is a persisted pinia store managing `Set[]`.

It is initially fed from files in `src/stores/initialSetData/*json`, which follow a shape like:

```json

{
  "language": "ar",
  "tasks": [
    "Make a sentence with 'أطلع'."
  ],
  "unitsOfMeaning": [
    {
      "uid": "apc_أنا لازم أطلع_sentence",
      "language": "apc",
      "content": "أنا لازم أطلع",
      "linguType": "sentence",
      "license": "CC-BY-NC-4.0",
      "owner": "Guy Mor-Lan",
      "ownerLink": "https://huggingface.co/guymorlan",
      "source": "Levanti Dataset",
      "sourceLink": "https://huggingface.co/datasets/guymorlan/levanti",
      "translations": [
        "en:I have to go."
      ]
    },
    {
      "uid": "en_I have to go._sentence",
      "language": "en",
      "content": "I have to go.",
      "linguType": "sentence",
      "license": "CC-BY-NC-4.0",
      "owner": "Guy Mor-Lan",
      "ownerLink": "https://huggingface.co/guymorlan",
      "source": "Levanti Dataset",
      "sourceLink": "https://huggingface.co/datasets/guymorlan/levanti",
      "translations": [
        "apc:أنا لازم أطلع"
      ]
    }
  ]
}

```