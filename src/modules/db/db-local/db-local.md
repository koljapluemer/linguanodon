# Local Dexie DB

## Use Cases

We are using a per-user database (local) to store the user's learning data, both units of meaning and learning goals as well as the progress (e.g. "last learned at").

## Content of `accessLocalDB.ts`

- Gets our Dexie.js DB up and running
- Only pulls together schemas from other parts of the app
- Should contain no data definitions in itself

## Testing

- Ensure that dexie DB is created and can be accessed