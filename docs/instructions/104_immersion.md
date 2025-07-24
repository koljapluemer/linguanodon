# Immersion Content

- *Very* similar to `Resource`, we want to also track `ImmersionContent`.
- These are like resources, only with the following differences:
- The do have `extractedUnits`, but they also have `associatedUnits`, which are units that help to understand the resource
- They are their own type, tracked in their own repo, on their own page, and so on, all parallel to `Resource`
- They also should have their own lesson template: Generate 5-19 exercises based on the `associatedUnits`, then, at the end, add a new exercise/task type that is much like the resource extraction, only that the learner is prompted to watch/read a bit of the immersion content, and to rate their understanding of it, and optionally they can extract units of meaning (like with resources)