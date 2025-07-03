# Managing Learning Goals

Learners should be able to manage their own learning goals. Here is an exemplary workflow:

1. The user decides to add a new learning goal, for example "know how to order coffee"

*This requires a view, (possibly components), a database table and utils*

2. The user decides that this learning goal should be split into smaller goals, for example
    - Understand numbers from 1-100
    - know greetings
    - know coffee shop vocabulary
    - be able to express "I want x"

*This requires functionality to both add a learning goal as a child of another learning goal, as well as to hook up learning goals already in the database. For example, a learning goal like "understand numbers from 1-100" could already be in the db, maybe even provided by the app. In that case, the UI should suggest it when the user wants to make such a learning goal. But again, they can also just create their own child goal, in the very same UI.*

3. The learner adds *units of meaning* to the given learning goal (and/or the child goals), as in *sentences and words* related to the goal. For example, for "know coffee shop vocabulary", they may want to add:
    - "coffee shop"
    - "coffee"
    - "how much is it?"


- *This should utilize the existing infrastructure for adding units of meaning*
- *Again, the UI should both allow adding new units of meaning, as well as suggest those that are close to the ones that user is typing in*

4. From now on, flows overlap: The learner may want to add translations to not-yet-translated words (*infrastructure for that exists*), or practice the units of meaning in exercises (*also general-use infra, but not yet implemented*)