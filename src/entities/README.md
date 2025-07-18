# Entities/

Slices on this layer represent concepts from the real world that the project is working with. Commonly, they are the terms that the business uses to describe the product. For example, a social network might work with business entities like User, Post, and Group.

An entity slice might contain the data storage (📁 model), data validation schemas (📁 model), entity-related API request functions (📁 api), as well as the visual representation of this entity in the interface (📁 ui). The visual representation doesn't have to produce a complete UI block — it is primarily meant to reuse the same appearance across several pages in the app, and different business logic may be attached to it through props or slots.
Entity relationships

Entities in FSD are slices, and by default, slices cannot know about each other. In real life, however, entities often interact with each other, and sometimes one entity owns or contains other entities. Because of that, the business logic of these interactions is preferably kept in higher layers, like Features or Pages.

When one entity's data object contains other data objects, usually it's a good idea to make the connection between the entities explicit and side-step the slice isolation by making a cross-reference API with the @x notation. The reason is that connected entities need to be refactored together, so it's best to make the connection impossible to miss.


## What is the difference between a feature and an entity?

An entity is a real-life concept that your app is working with. A feature is an interaction that provides real-life value to your app’s users, the thing people want to do with your entities.

For more information, along with examples, see the Reference page on slices.