# Shared/

This layer forms a foundation for the rest of the app. It's a place to create connections with the external world, for example, backends, third-party libraries, the environment. It is also a place to define your own highly contained libraries.

This layer, like the App layer, does not contain slices. Slices are intended to divide the layer into business domains, but business domains do not exist in Shared. This means that all files in Shared can reference and import from each other.
