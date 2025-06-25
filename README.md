# The Masry App

Your ultimate app to learn Egyptian Arabic.

*work in progress*.

## Development

### Stack

- `Vue3`
- ts
- Bulma
- Dexie
- Vue Router


### Folder Structure

- Standard folder-by-type
    - (because I'm not yet sure what the modules would be)


### Data Flow

- our data model is defined in `types/`
- Dexie databases are the source of truth, running fully local
    - defined in `src/dexie`
- `utils/` contain functions to work with types
- views such as `EditUnitOfMeaning` then allow users to manipulate data