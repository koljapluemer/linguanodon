# How to Add a Feature

## High-Level Organisation

As a rule:

- Open an issue (work towards an issue)
- make a branch

## Development

- Add unit tests via the configured `vitest` environment (see config in `nuxt.config.ts` and `vitest.config.ts`)
  - It's not required to use TDD, but it may make sense, especially when working on logic-heave features
  - However, each added feature should at least be convered in regards to basic happy path

- Keep files reasonably small.
- Write VERY CLEAN code. functions and lines of code should be self-explanatory. If a collection of code lines is confusing to read (or even just a single line), it should likely be its own function
- Keep components and pages as purely representational as possible

- Types and interfaces live in `/types` unless they are 100% only usable in one file or page. Do NOT, EVER, copypaste types in component files

## Documentation

- Write conceptual stuff in `doc/` as a markdown guide
- Code should mostly document itself, see chapter above
- Use JsDoc style annotation, but ONLY!! to explain purpose or non-obvious decisions. Do NOT! JS-Doc annotate params or returns, that is *already done* by typescript. Keep it short.

## Tech Stack

- Standard Nuxt app
    - Meaning, per-default, we are doing things *server-side*

### Nuxt Plugins

- `eslint` is setup. Don't forget to run linter.
- utilize `@nuxt/fonts` for fonts. keep it basic.
- use `@nuxt/icon`, so icons should be valid [iconify](https://iconify.design/)
- use `@nuxt/test-utils` to get good unit test coverage
- we have `Tailwind` + `Daisy UI` installed, utilize that for design
    - Avoid manual CSS when possible

### Data

- source of truth is a local, per-user `dexie.js` database
    - must, of course, be used with `ClientOnly`