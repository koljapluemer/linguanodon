All of the learning apps in here track some user usage/learning data.

I'd like to unify this a bit.

- For I think every app, there is something like a unit/exercise/trial count that we can track, e.g. per day. Also, we can track meaningful active time. These could live as a standardized data model.
- Most apps also store bespoke learning data, that can usually be represented as simple JSON.
- We want to track the underlying learning data as commited, dedicated sqlite dbs. These should not interact with user stat tracking.
- This app should be usable for non-signed in users and for signed in users. For signed-in users, we want to sync learning data (w/o losing the local-first tracking, I think). 
    - We can fairly naively resolve most if not all merge conflicts, since data is often read-only (time-stamped events) or not high value (when we lose one trial when tracking spaced repetition for a word, no biggie)
- I'm currently running this on a cheap VPS. I'm fine w/ eventually upgrading, but I rather not have the reason being that we spam the server w/ low value tracking
- I'd like to standardize tracking as much as reasonable, so adding new interfaces becomes easier. However, I also don't want to lock down options.