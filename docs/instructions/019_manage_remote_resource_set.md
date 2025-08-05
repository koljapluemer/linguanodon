# Managing Remote Resource Sets

- let's allow the user managing remote `Resource` sets
- A `RemoteResourceSet` extends [localobject](src/shared/LocalObject.ts). Apart from that, it has one prop `resources` of to-be-defined type `RemoteResource`
- `RemoteResource` is a simplified, server-side "version" of [ResourceData](src/entities/resources/ResourceData.ts). It has:
  - language (string code)
  - priority: number
  - name

that's it.

- `RemoteResourceSet`s live "on the backend", which for now just means our `/public/` folder
- From the user side, they can be seen as a list on a tab on our [download page stub](src/pages/downloads/PageDownloads.vue) (see also [doc](docs/instructions/016_remote_stubs.md))
- This page should have a dropdown with the user languages (see [doc](docs/instructions/018_basic_language_mngmt.md)), and then load available remote resource sets from `public/resource_sets/$language_code/`
- The user can then download them from there (or see an "already downloded" message)
- when downloaded, they should be used to create and persist proper `ResourceData` objects.

## Clarification Questions

1. **RemoteResource Structure**: The spec mentions `RemoteResource` has `language`, `priority`, and `name`. Should this also include other essential fields from `ResourceData` like `taskType`, `title`, `prompt` (from TaskData interface), or just the minimal three fields?

No. these are autofilled when creating the actual resource (check out the [demo data](src/shared/demo-data/demo.json) if that helps) with values that make sense for Resource objects

2. **File Structure**: Should the remote resource sets be stored as individual JSON files in `/public/resource_sets/$language_code/` (e.g., `/public/resource_sets/en/beginner-pack.json`) or as a single index file per language that lists available sets?

assume that in each language code folder you have an `index.json` with a simple array of names that are avaiable. the specific ones are then $name.json

3. **Resource Set Naming**: How should `RemoteResourceSet` be identified? Should it have its own `uid`, `name`, or use a filename-based approach?

name, which is equal to filename

4. **Download State Tracking**: How should we track if a resource set has been "already downloaded"? Should we store downloaded set IDs in localStorage, or add a field to track this in the ResourceData objects themselves?

Simply persist *names* in localstorage.

5. **Resource Conversion**: When converting `RemoteResource` to `ResourceData`, what should we use for the missing TaskData fields (`taskType`, `title`, `prompt`, etc.)? Should we have defaults or derive them from the remote resource properties?

Check how resources usually work, e.g. when the user creates them manually. See the [entity folder](src/entities/resources) 

6. **Tab Integration**: Should the new remote resource sets tab replace one of the existing tabs ("Download Example Packs", "Download Resource Challenges") or be added as a third tab?

set it as a first tab, remove the 2 demo tabs

7. **Language Filtering**: Should the language dropdown filter show all user target languages, or only those that have available remote resource sets in the public folder?

all user target langs

8. **Error Handling**: How should we handle cases where the `/public/resource_sets/$language_code/` folder doesn't exist or is empty for a selected language?

show no resource sets in the list!?

9. **Resource Dependencies**: Should `RemoteResource` include references to vocab, examples, or fact cards that need to be created alongside the resource, or keep it minimal as specified?

as fucking specified

10. **Resource Set Metadata**: Should `RemoteResourceSet` include metadata like description, author, version, or creation date to help users choose which sets to download?

no, as fucking specified