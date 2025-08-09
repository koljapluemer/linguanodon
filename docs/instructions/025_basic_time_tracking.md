Make a very basic time-spent-learning tracker.
Simply save in localstorage (not! dexie), dict with dates as keys.

Learning time is only counted in [Queue](/home/brokkoli/GITHUB/linguanodon/src/pages/queue/PageQueue.vue), and only if the browser tab is focussed. after 20 seconds of user inaction stop counting time.

Make a page with a simple counter where the user can see a bar chart with time spent learning per day,
and 3 stats (daisyui has an element for that!) with minutes spent today, this week, and overall. KISS.