# How to Add a Feature

## High-Level Organisation

As a rule:

- Open an issue (work towards an issue)
- make a branch

## Development

- Add unit tests via the configured `vitest` environment
  - It's not required to use TDD, but it may make sense, especially when working on logic-heave features
  - However, each added feature should at least be convered in regards to basic happy path

- Keep files reasonably small.
- Write VERY CLEAN code. functions and lines of code should be self-explanatory. If a collection of code lines is confusing to read (or even just a single line), it should likely be its own function
- Keep components and pages as purely representational as possible

- Types and interfaces live in `/types` unless they are 100% only usable in one file or page. Do NOT, EVER, copypaste types in component files

- ALWAYS use `@/...` import syntax, except if the the imported thing is in the same directory. That's way more robust, and way more readable.

## Documentation

- Write conceptual stuff in `doc/` as a markdown guide
- Code should mostly document itself, see chapter above
- Use JsDoc style annotation, but ONLY!! to explain purpose or non-obvious decisions. Do NOT! JS-Doc annotate params or returns, that is *already done* by typescript. Keep it short.

## Tech Stack

- Standard Vue + Vite app
    - Meaning, per-default, we are doing things *server-side*

### Nuxt Plugins

- `eslint` is setup. Don't forget to run linter.
- we have `Tailwind` + `Daisy UI` installed, utilize that for design
    - Avoid manual CSS when possible

### Data

- source of truth is a local, per-user `dexie.js` database