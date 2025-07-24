# Learning Goal Flow

We want to allow the user to track learning goals.
A `LearningGoal` should be a type, with its own repo, similar to `Resource`.

`LearningGoal`s should have associated `Word`s and `Sentences`, as well as an array `Milestone[]`.

`Milestone` also needs to be defined, right now it should just be a simple object with the prop `content: string`.

There should be a page where learning goals are listed, similar to `list-resources`.

We also want to add a new `LessonTemplateFactory` option to generate a lesson based on a learning goal:

- Pick 5-19 words/sentences from the learning goal and make the standard cards with them
- At the very end, add a special exercise that renders as a `MilestoneTask` (with a milestone randomly picked from the learning goal) which simply prints the milestone's content and then let the user rate how hard that was