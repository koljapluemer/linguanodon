# get list of available languages

- utilizes `accessRemoteDB.ts` for the direct db stuff
- accesses `/language_tags.json` and returns the provided data as `Language[]` (types match exactly)

## Testing

- simply test whether access works and returns a non-empty, well-formed array
- test that unlikely-to-change languages are present, i.e. with tags "en", "fr" and "de"