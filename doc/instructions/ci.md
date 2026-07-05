This collection language learning tool houses various interfaces for language learning.
Let's add an interface for superbeginner comprehensible input watching.
Follow the standard flavor: custom sqlite + django orm for the data backend, simple django templates, vanilla js with jsdoc annotation.

However, what's new, we also need user accounts at this point:
- add user account flows for signup and signin
- add user roles, following django standards: NEW, TRUSTED, MODERATOR, ADMIN

Note that *later* we're going only allow paid accounts, so perhaps keep that in mind if relevant to the architecture.
Users should be managed by the general postgres db, being able to later interact with all the learning interfaces

Only users w/ ADMIN can, at this point, add comprehensible videos to the app we're building here.
Make it very simple for now: youtube_id (the part of the url), title, and language (make this a model with, for now, just plain string name)
Standard CRUD views.

Any user, also not signed in, can select an available language, then see the available videos.
They can click on a video, and watch it w/ an embeded youtube player.
Track the time spent actually watching (per language and video) w/ IndexedDB.
Have a stats route where users can see how much they have watched per language.

That's the whole spec for now. Keep it lean. Use the core template w/ daisy and tailwind. Do not waffle. Keep focussed, like an internal expert app.