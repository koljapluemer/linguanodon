# Shared/

This layer forms a foundation for the rest of the app. It's a place to create connections with the external world, for example, backends, third-party libraries, the environment. It is also a place to define your own highly contained libraries.

This layer, like the App layer, does not contain slices. Slices are intended to divide the layer into business domains, but business domains do not exist in Shared. This means that all files in Shared can reference and import from each other.

Here are the segments that you can typically find in this layer:

    📁 api — the API client and potentially also functions to make requests to specific backend endpoints.
    📁 ui — the application's UI kit.
    Components on this layer should not contain business logic, but it's okay for them to be business-themed. For example, you can put the company logo and page layout here. Components with UI logic are also allowed (for example, autocomplete or a search bar).
    📁 lib — a collection of internal libraries.
    This folder should not be treated as helpers or utilities (read here why these folders often turn into a dump). Instead, every library in this folder should have one area of focus, for example, dates, colors, text manipulation, etc. That area of focus should be documented in a README file. The developers in your team should know what can and cannot be added to these libraries.
    📁 config — environment variables, global feature flags and other global configuration for your app.
    📁 routes — route constants or patterns for matching routes.
    📁 i18n — setup code for translations, global translation strings.

You are free to add more segments, but make sure that the name of these segments describes the purpose of the content, not its essence. For example, components, hooks, and types are bad segment names because they aren't that helpful when you're looking for code.