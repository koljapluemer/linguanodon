# Downloading Tasks from Remote Sets

Users can download tasks (with attached data) from remote.


## Progress & Logic

### Viewing Remote Sets

- The learner can go to [this page](../src/pages/PageRemoteListAllSets.vue) to list all the sets we have in our db
- This page calls [this controller component](../src/components/lists/control/ListControllRemoteSets.vue)
- This controller needs to, right away, access [this util](../src/utils/databaseFetch/getSets.ts), which should provide the following functions:
  - One getting all available languages (=languages that have at least 1 set)
    - GET https://scintillating-empanada-730581.netlify.app/languages.json
    - returns a flat string array with language codes such as "it" or "apc"
  - One getting, for a given language (=language code), the available sets
    - GET an endpoint such as https://scintillating-empanada-730581.netlify.app/apc/index.json
    - The data is in the structure typed as `RemoteSets` in [this util script](../src/utils/databaseFetch/getSets.ts)
- These functions will be used as follows:
  - The available languages will be passed to [this representational component](../src/components/lists/parts/ListPartFilterByLanguage.vue) which renders a dropdown with the available languages and emits up which one the learner chooses
  - Using the learner-selected languages, the controller `ListPartFilterByLanguage` gets the available sets for this language (using the function described above) and passes them as props to [this render component](../src/components/lists/render/ListRenderRemoteSets.vue)
  - ...which in turn renders them as a DaisyUI table, each row being made from [this widget](../src/components/lists/widgets/ListWidgetRemoteSet.vue)
- This widget shows the name of the set, as well as a Download button (we will implement that in the next step)