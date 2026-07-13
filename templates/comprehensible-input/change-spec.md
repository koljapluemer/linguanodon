Banish the current ./home.html to a "All Videos" route, accessible from app header.
On main, instead, we want a sort of infinite flow.
If language-to-learn not set yet, ask for it, same way we are now. Persist this in localstorage.
Then, load a random video for this lang.
Make the ui a bit neater, making the video grow to all available height/width (w/o cutoff, like theater mode), and put in the background a blurred version of the youtube thumbnail.
You may need to change base template to allow for this.
Then, we want a floating button, midheight, on the right of the screen "End Watch".
This should open a modal with questions/prompts:

- I understood what was going on (5 options from strongly disagree to strongly agree, w/ radio group)
- I understood the spoken language intuitively (same UI)
- I want to watch this video further/again (4 options: No, Yes, Certainly!)

For now, simply persist these answers locally, and load a new random video.
When persisting, also save which sections of the video the user actually watched (even if they skip around) —— don't overengineer this or poll so much that the fans keep spinning, but be reasonably robust if the user skips a part, pauses, etc. These data will be relevant later.

Stick to @doc/design-system.md