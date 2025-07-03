# Feature: Canonical Language List Fetch & Cache

## Overview
Fetch the canonical list of supported languages (IETF BCP 47 tags, names) from the backend and cache it in Dexie. Expose a composable to access the list, with freshness checks and a manual refresh option.

## Requirements
- On first use, fetch the language list from the backend and store it in Dexie.
- On subsequent uses, use the cached list if it is fresh (e.g., <24h old).
- Provide a way to manually refresh the list from the backend.
- Expose a composable to access the list reactively.
- Handle backend errors gracefully (show stale data, allow retry).

## Tests (to be written before implementation)
- Fetches and stores the language list in Dexie on first use.
- Uses cached list if it is fresh.
- Fetches a new list if cache is stale or on manual refresh.
- Exposes the list reactively via composable.
- Handles backend errors and falls back to cached data.
- Manual refresh updates the cache and composable output. 