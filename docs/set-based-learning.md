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
        "en_I have to go._sentence"
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
        "apc_أنا لازم أطلع_sentence"
      ]
    }
  ]
}

```

Note that the json files list the full `UnitOfMeaning` objects, while `Set` only expects an array of their UIDs. So we need some smart seeding algo for the initial data.

We then want a page where we can see all these sets:

- `PageListAllSets.vue`, which mostly just calls [the controller component](../src/components/lists/control/ListControlAllSets.vue)
- this controller component uses the `setStore` to get all `Set`s, and then passes that to [the render component](../src/components/lists/render/ListRenderSets.vue)
- this component is pretty dumb, and only takes props and emits events
- it uses a daisyUI table to render each row as [a widget](../src/components/lists/widgets/ListWidgetSet.vue)
- within each such widget, we want an icon button "Practice" that router-links to our next feature

...which is:

- `PagePracticeSet` takes an url prop (`Set` uid) and passes that to [the control component](../src/components/practice/set/PracticeSet.vue)
- This component gets the set from the store, and more importantly, its units of meaning.
- Using those, it utilizes [this util](../src/utils/generateExercises.ts) to get `Exercise[]`, specifically `FlashcardExercise[]` (see types)
- What we want is cloze-based flashcards, and specifically all clozes that are possible for a sentence-translation pair, on a per-word base. E.g., if we have  `I have to go. | أنا لازم أطلع `, we want the following cloze:
  - ؟؟؟ لازم أطلع 
  - أنا ؟؟؟ أطلع 
  - أنا لازم ؟؟؟ 
  - ??? have to go.
  - I ??? to go.
  - I have ??? go.
  - I have to ???.

- Cloze cards should be specifically designed like this:
  - `front:` clozed sentence
  - `back:` sentence that was clozed completely, with the would-be closed bold (`<b>`), and the opposite translation below it
- Note:
  - We are using the ؟؟؟ and ??? to have no problem with directionality
  - We are not replacing sentence characters

- From those generated exercises, we want to pick 20 at random, and shuffle them. These are passed back to `PracticeSet.vue`
- The component then manages to go from one Exercise to the next, and always loads the renderer `ExerciseFlashcardRender`
- Flow for this component is the following: show front side and a reveal button, once revealed, show back and "Hard", "Wrong", "Correct", "Easy", then send score event up
- This event will then, *later*, handled by `exerciseStore` (but not yet implemented)
- After 20 exercises done, go back to the list of sets, sending a friendly [toast](../src/components/ui/toasts/useToasts.ts)