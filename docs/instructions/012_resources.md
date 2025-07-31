# Resources

An entity related to reading blog posts about grammar or watching videos with important language knowledge

## Similarities to ImmersionContent

- `Resource` is extremely similar to the `ImmersionContent` (`src/entities/immersion-content`) entity, as you can see when checking [its interface](src/entities/resources/ResourceData.ts) which is already defined
- It should have its own repo (with contract and dexi implementation), and its own task, structured like [this one](src/widgets/task-for-immersion-content).
- The differences are:
    - The wording on the Resource task is "extract important words and examples from the resource"
    - It should be possible to manage in this task both