# Immersion Content to Resource Migration

## Task Overview
Consolidate `ImmersionContentData` into `ResourceData` using the `isImmersionContent: boolean` flag to differentiate between regular resources and immersion content. This eliminates duplicate data structures while preserving semantic differences.

## Progress Made
✅ **Core Data Layer**
- Updated `ResourceRepo.saveResource()` to require explicit `isImmersionContent`
- Added `isImmersionContent` toggle to `ResourceAddForm.vue`
- Updated `UnifiedRemoteSetService.ts` to use `resourceSchema.isImmersionContent` from remote data
- Removed all immersion content processing from remote sets (now unified under resources)
- Fixed repository injection in `injectRepositories.ts`

✅ **Data Structure**
- Deleted `ImmersionContentData.ts`
- Deleted `ImmersionContentRepo.ts` and `ImmersionContentRepoContract.ts`
- `resourceSchema.ts` already has `isImmersionContent: boolean` field

## Remaining Work
🔄 **Component Updates** (in progress)
- Replace `ImmersionContentData` imports with `ResourceData` in:
  - `ImmersionContentFormRenderer.vue`
  - `ImmersionContentListWidget.vue` 
  - `ManageImmersionContentVocab.vue`
- Update these components to use `ResourceRepoContract` instead of `ImmersionContentRepoContract`

🔄 **Page/Router Updates**
- Remove immersion content routes from `router.ts`
- Remove/redirect immersion content pages
- Update `PageDownloads.vue` constructor args (now 7 instead of 8)

🔄 **Task System Updates**  
- Update `makeTask.ts` and `PageQueue.vue` to use ResourceRepo
- Ensure `isImmersionContent: true` resources generate different tasks than regular resources
- Ensure extract knowledge tasks are NOT generated for immersion content

## Key Behavioral Requirements
1. **Task Generation**: `isImmersionContent: true` should generate different task types
2. **Extract Knowledge Task**: Should NEVER be generated for immersion content
3. **Mastery Bar**: Vocab mastery bars should remain for immersion content pages
4. **UI Differentiation**: Different flows based on `isImmersionContent` flag

## Technical Notes
- Remote schema `resourceSchema.ts` already has `isImmersionContent: boolean`
- No database migration needed (user reset DB)
- Use `ResourceRepoContract` everywhere, filter by `isImmersionContent` when needed
- Preserve semantic differences through conditional logic, not separate data types

## Current Build Errors
- Various files still importing deleted immersion content types
- Constructor signature mismatches after removing immersion content repo
- Components need to be updated to use ResourceData/ResourceRepo

## Next Steps
1. Fix remaining import errors by replacing with ResourceData/ResourceRepo
2. Update router to remove immersion content routes  
3. Test task generation respects `isImmersionContent` flag
4. Verify mastery bars still work for immersion content