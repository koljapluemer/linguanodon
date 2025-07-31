## Fact Cards

A representation of flashcards for knowledge such as grammar rules or culturual practices.
Not everything can or should be represented as target lang words or examples, thus we have this.

The user is able to manage, list and practice flashcards.

The type is already defined [here](src/entities/factCards/FactCardData.ts)

Add a list view, edit view, repo, repo interface.
Take inspiration from "examples" and "vocab" throughout the repo, as their structure and their pages are similar.

For now, just build the list and edit pages, integration into the main learning will follow later.

## Clarification Questions

1. **Front/Back Content Format**: Should the `front` and `back` fields support:
   - Plain text only?
   - Rich text/Markdown formatting?
   - HTML content?

Basic markdown. Check "vocab" integration, we do the same thing there. We already have a [md renderer component](src/shared/ui/MarkdownRenderer.vue)

2. **Practice Integration**: For the `LearningProgress` field, should fact cards:
   - Use the same spaced repetition algorithm as vocab (ts-fsrs)?
   - Have the same difficulty ratings (Impossible/Hard/Doable/Easy)?
   - Follow the same mastery level progression?

What do you not understand about "INTEGRATION INTO THE MAIN LEARNING WILL FOLLOW LATER"!?!?!?!??! Build the fucking list and manage page, NOTHING LESS, NOTHING MORE. NOOOOOOOOOO LEARNING LOGIC FOR NOW!!!!!!!!

3. **Notes Integration**: Since `notes` are string UIDs referencing the note repository:
   - Should fact cards display notes in their list view?
   - Should the form allow managing notes inline like vocab forms?
   - Should notes be used for additional context or study tips?

Not in the list. Only on the manage page. yes, allow inline editing on the page. yes, notes are for taking notes idk what to tell you.

4. **Search and Filtering**: For the list view, should users be able to search by:
   - Front content only?
   - Both front and back content?
   - Language and notes content?
   - Priority level and practice status?

- automatically match front and back (for now)

5. **Validation Rules**: What validation should be applied?
   - Are both front and back fields required?
   - Should there be character limits?
   - Should language be validated against a specific set?

front and back required. no limits. no lang validation.

6. **Priority and Practice Settings**: 
   - Should priority work the same as vocab (1-5 scale)?
   - Should `doNotPractice` hide cards from future learning sessions?
   - Any default values for new cards?

I do not know who ever told you about a 1-5 scale. That was never in the requirements, not for vocab, not for this. It's just a number. Stop hallucinating.
Yes, that's what `doNotPractice` will maybe do in the future, when we integrate it, which we are not fucking doing right now.
Please check previous implementations. Obviously no default values for front or back. the progress extends `ts-fsrs` `Card` and HAS TO!!! be initialized in a certain way. check how that's done with "VocabData"

7. **Demo Data Content**: What type of fact cards should be included as examples?
   - Grammar rules (e.g., "When to use subjunctive" / "Use after emotions, doubt, desire")?
   - Cultural facts (e.g., "Italian greeting customs" / "Kiss on both cheeks, start with left")?
   - Language tips (e.g., "False friends: 'library'" / "Biblioteca ≠ Library (bookstore)")?

yea idk the 3 sounds fine.