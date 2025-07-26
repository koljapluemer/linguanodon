# Features/

This layer is for the main interactions in your app, things that your users care to do. These interactions often involve business entities, because that's what the app is about.

A crucial principle for using the Features layer effectively is: not everything needs to be a feature. A good indicator that something needs to be a feature is the fact that it is reused on several pages.

For example, if the app has several editors, and all of them have comments, then comments are a reused feature. Remember that slices are a mechanism for finding code quickly, and if there are too many features, the important ones are drowned out.

Ideally, when you arrive in a new project, you would discover its functionality by looking through the pages and features. When deciding on what should be a feature, optimize for the experience of a newcomer to the project to quickly discover large important areas of code.

A feature slice might contain the UI to perform the interaction like a form (📁 ui), the API calls needed to make the action (📁 api), validation and internal state (📁 model), feature flags (📁 config).

## What is the difference between a feature and an entity?

An entity is a real-life concept that your app is working with. A feature is an interaction that provides real-life value to your app’s users, the thing people want to do with your entities.

For more information, along with examples, see the Reference page on slices.