# Downloading Remote Task Sets

- continuation of [this feature](004_viewing-remote-task-sets.md)

## Goal

- From remote, a [Set](../src/entities/Set.ts) and all its attached data is downloaded and persisted.

## Process

- When clicking "Download" in [this component](../src/components/lists/widgets/ListWidgetRemoteSet.vue), the given set should be downloaded
- The fetch etc. is handled by [this util](../src/utils/databaseFetch/getSet.ts), which also contains some relevant types, and should house all the functions
  - uses an endpoint like GET https://scintillating-empanada-730581.netlify.app/apc/natural_sentences_2.json
  - data is typed `RemoteSet` (defined in the util)
- A set contains the following data, all of which should be persisted in their own store
    - (minimal) data for the (local) [set itself](../src/entities/Set.ts)
        - this is such a minimal type because "Set" isn't really a meaningful entity locally — we just have it so we can track on the download page which sets we have downloaded
        - The (small) store is defined [here](../src/stores/setStore.ts)
    - [Task](../src/entities/Task.ts)s
        - defined in [this store](../src/stores/taskStore.ts)
    - Tasks in turn have 1-2 arrays referring to units of meaning, which have...
        - [their own type](../src/entities/UnitOfMeaning.ts)
        - [their own store](../src/stores/unitOfMeaningStore.ts)

- Note: the types for remote and local data often differ.
    - Often the remote types (e.g. `RemoteUnitOfMeaning`) have lots of optional data, while the local entity types (e.g. `UnitOfMeaning`) have little optional things, preferring empty arrays over missing props

- `UnitOfMeaning.card` has to be created with the `ts-fsrs` function, described [here](external/ts-fsrs-readme.md)
- Note the [pinia doc for referencing other stores](external/pinia-referencing-other-stores.md)

- When downloading, keep track of whether data already exists locally
    - Use the following indicators:
        - Sets are unique by their language + name
        - Units of Meaning ore unique by language + content
        - Tasks are unique by language + content
    - If something is already present locally:
        - Sets: If a set is already present, the download button shouldn't be rendered in the first place. Instead, we should see "Downloaded $human_readable_date"
        - Tasks: simply skip over
        - Units Of Meaning: simply skip over
    - At the end, show a [toast](../src/components/ui/toasts/useToasts.ts) with something like "Set $name downloaded. Added $n tasks and $n words and sentences. ($n tasks and $n words and sentences skipped because they were already present)"

## Pages

The user should be able to see their downloaded stuff, with pages following always the same structure
- `pages/PageList*` calls `components/list/ListControllAll*`, that calls similarly named `Render` component, that creates a table, that uses a `ListWidget*` component for each row
- We want the following pages:
    - list all units of meaning (on user side called "words and sentences")
    - list all tasks