# Calculating Vocab Mastery

- A given `Vocab` unit has a mastery value from 0 to 100
- It is made equally from four parts:

    - The *retrievability* of the card in 1 day (read [this doc](https://app.unpkg.com/ts-fsrs@5.2.1/files/dist/index.d.ts) and use `get_retrievability`) (valu from 0 to 100)
    - the retrievability in 1 week
    - the retrievability in 1 year
    - the level of the card (-1 is lowest value, 4 or more maps to the highest) 


- make sure to implement this as an entity function and to correctly calculate it via `ts-fsrs`, also display it in the list of vocab and on the view where we manage vocab.

## Clarification Questions

### Mastery Calculation Weighting
- Should all 4 components (1-day, 1-week, 1-year retrievability + level) be weighted equally at 25% each, or are different weights preferred?
- For the level component, should the mapping be linear (level 0=20%, 1=40%, 2=60%, 3=80%, 4+=100%) or different scaling?

all equal, yes, linear

### Edge Cases
- How should mastery be calculated for brand new vocab (level -1) that hasn't been reviewed yet? Currently returns 0% - is this correct?
- Should there be a minimum mastery floor (e.g., never below 5%) or can it truly be 0%?

0% is fine

### Performance Considerations
- The mastery calculation requires ts-fsrs computations for each vocab item. Should this be cached or computed on-demand?
- For large vocab lists, should we pre-compute mastery values during data loading or calculate them in the UI?

I think for now we can compute on demand. on large lists, is fine if the mastery progress bar is hidden until it is calculated

### Display and Usage
- Should mastery be displayed with decimal precision (e.g., 67.3%) or rounded to whole numbers (67%)?
- Are there specific mastery thresholds that should trigger different UI states (colors, badges, etc.)?
- Should mastery calculation be exposed as a separate API endpoint for potential external integrations?

yes, whole numbers only. no thresholds yet. its fine if its exposed by the `Vocab` entity

### Backward Compatibility
- Should the old `calculateMasteryLevelForVocab` method be deprecated or maintained for backward compatibility?
- Are there any migration considerations for existing vocab data?

we're still doing an mvp here. no old data, kill old method