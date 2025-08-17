# Better Sets & Tracking Set Reference

- let's make `SetData` its own entity with its own folder `/src/entities/sets`, its own repo, its own repo contract (see other repos to see how its done)
- utilize this repo instead of the hacky [remote resource service](src/features/download-resource-sets/RemoteResourceService.ts).
- Use a proper dexie repo and get rid of the localstorage persistence
- I added `origins` to various `*Data.ts` interfaces. This prop should be used for the following two cases:
a) if a user *creates* immersion content/vocab/resource/fact card, add 'user-added' to `origins`
b) if a user [downloads](src/pages/downloads/PageDownloads.vue) some set, append the set uid to the downloaded object's `origins` prop
