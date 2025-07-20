# Resource Flow

We want to generate exercises based on [Resources](src/entities/resources/ResourceData.ts).
The idea is that the user sees a resource, and is prompted to linguistic units based on it.

We are talking blog posts or grammar guides, from which example sentences and vocab can be extracted.

For that, we need a new "type" of lesson;
currently, we have hardcoded a specific flow of exercises in every lesson ([here](src/pages/practice/model/LessonGenerator.ts)).

Instead, we need a little abstraction — different functions generating different "lesson templates" (not a type, just a mental model).
The existing flow is one such lesson template.
In the future, we want to randomly pick between exercises. We roll a die and randomly...

- call the function that builds a lesson according to the old plan (free translation of a sentece)
- call the function that builds a lesson around a resource

This new paradigm should work as follow:

- Quite like in the other template, randomly pick a nr of exercises, and just fill them with random due words & sentences
- Then, at the end, add a special exercise, a type we have to build:

- Based on a Resource; for now, just pick one from the repo randomly (mybe we need to build that functionality within the entity repo and repo interface)

- Shows the user the ResourceData (we need to build a new [Task](src/pages/practice/ui/tasks/TaskRegistry.ts)), including title, link, prompt, extraInfo
- Then shows the user a multi-form, which we want to build within the [ui folder of the linguisticUnit entity](src/entities/linguisticUnits/ui).
- The forms are to "Add Words and Sentences"; they are managed via `extractedUnits: LinguisticUnitIdentification[]` on the side of the resource
- They render the existing connected units, each in a row.
- Below that, they ensure that always a row for adding a new unit is displayed that's completely empty (smartly shrink and grow)
- Each row looks like this: 
    - Segmented toggle to say whether the row is a sentence or a word
        - We probably need some fancy functionality to delete the data from sentence repo and move to word repo or vice versa
    - Dropdown to select a language (see [language repo](src/entities/languages/LanguageRepository.ts))
    - input to put in the `content` of the unit (gets wider when its marked as sentence)
    - little separator like "|"
    - another language dropdown
    - another input, again wide or not, to input content of translation
    - save button, delete button

- *note* that this is a user convenience. linguistic units are still represented through the [same old repo](/home/brokkoli/GITHUB/linguanodon/src/entities/linguisticUnits/LinguisticUnitData.ts), and each translation is a separate such unit, and we can only specifically persist them as a sentence, or as a word.
- *note* that in this multi-form, it is not required to add a translation for a given row. if field is empty, ignore it.
- we want to implement this multi-form in the entitity folder (but of course not the task itself!!) because we will need to resuse it for other features!


- Below, we have two buttons: "Skip" and "Done For Now"
    - "Skip" immediately tells the lesson to go to the next exercise (and thus it ends the lesson in the current setup)
    - "Done for Now" brings us to a new "screen" (managed *internally* in the Task component!!)
        - Shows "Do you want to work on this resource in the future?"
        - Two buttons "Yes" and "No", which effectively do nothing except telling the lesson to go on to the next; this is just a placeholder for future stuff

- Note that the current implementation of exercise/lesson flow is quite insistent on saving learning events. this is is not relevant for this specific task, which may require some engineering