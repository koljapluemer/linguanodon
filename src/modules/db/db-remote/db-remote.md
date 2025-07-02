# Remote DB

Users can download learning goals (and their attached units of meaning) from a backend API.

This modul provides utils and definitions to talk to this API.

---

Currently, the backend API is simply a static site, which directly exposes JSON files.

This may change in the future. The purpose of `accessRemoteDB.ts` is to act as a proxy to this backend, so that the remote API may later change (e.g. to a full-blown REST API) and we only have to change this very file.

## Implementation Details

## Testing

- Ensure that a basic connection works
- Ensure that all proxy work