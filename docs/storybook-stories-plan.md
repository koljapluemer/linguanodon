# Storybook Stories Implementation Plan

This document outlines the comprehensive plan for creating Storybook stories for all components in `src/widgets/` and `src/features/` directories.

## Current Status

### Existing Stories ✅
The following stories already exist and are complete:

**Features:**
- `AddPronunciationWidget.stories.ts` - Features/AddPronunciationWidget
- `DoTaskWidget.stories.ts` - Features/DoTaskWidget  
- `EditGoalWidget.stories.ts` - Features/EditGoalWidget
- `EvaluateTaskWidget.stories.ts` - Features/EvaluateTaskWidget
- `ExampleFormController.stories.ts` - Features/ExampleFormController
- `ExampleListWidget.stories.ts` - Features/ExampleListWidget

**Widgets:**
- `FreeTranslateTaskWidget.stories.ts` - Widgets/FreeTranslateTaskWidget
- `RenderTaskForAddingPronunciation.stories.ts` - Widgets/RenderTaskForAddingPronunciation
- `RenderTaskForImmersionContent.stories.ts` - Widgets/RenderTaskForImmersionContent
- `TaskAddExamplesToGoal.stories.ts` - Widgets/TaskAddExamplesToGoal
- `TaskAddMilestones.stories.ts` - Widgets/TaskAddMilestones
- `TaskAddSubGoals.stories.ts` - Widgets/TaskAddSubGoals
- `TaskAddVocabToGoal.stories.ts` - Widgets/TaskAddVocabToGoal

## Missing Stories to Create

### Features Directory - Missing Stories ❌

Based on the Feature-Sliced Design architecture, these features need stories:

#### Complex Form Controllers & Business Logic
1. **`ImmersionContentFormController.stories.ts`** - Features/ImmersionContentFormController
   - Stories: Default form, Edit mode, Validation states, Language variants
   - Dependencies: Mock ImmersionContentFormRenderer
   
2. **`VocabFormController.stories.ts`** - Features/VocabFormController  
   - Stories: New vocab, Edit mode, With/without pronunciation, Error states
   - Dependencies: Mock VocabFormRenderer

3. **`VocabListController.stories.ts`** - Features/VocabListController
   - Stories: Empty list, Populated list, Loading, Pagination, Filtering
   - Dependencies: Mock VocabListRenderer and pagination logic

#### Management Widgets
4. **`ImmersionContentListWidget.stories.ts`** - Features/ImmersionContentListWidget
   - Stories: Empty, Populated, Different content types, Loading states
   
5. **`ManageExamplesOfGoalWidget.stories.ts`** - Features/ManageExamplesOfGoalWidget
   - Stories: No examples, With examples, Add/edit modes, Goal context variations

6. **`ManageMilestonesWidget.stories.ts`** - Features/ManageMilestonesWidget  
   - Stories: Empty milestones, Multiple milestones, Different completion states

7. **`ManageSubGoalsWidget.stories.ts`** - Features/ManageSubGoalsWidget
   - Stories: No sub-goals, Multiple sub-goals, Nested hierarchies, Progress states

8. **`ManageVocabOfGoalWidget.stories.ts`** - Features/ManageVocabOfGoalWidget
   - Stories: Empty vocab list, Associated vocab, Different mastery levels

9. **`ManageVocabOfImmersionContentWidget.stories.ts`** - Features/ManageVocabOfImmersionContentWidget
   - Stories: Content with/without vocab, Different vocab difficulty levels

10. **`MarkGoalCompletionWidget.stories.ts`** - Features/MarkGoalCompletionWidget
    - Stories: Incomplete goal, Completable goal, Already completed, Different goal types

#### Practice & Exercise Components  
11. **`PracticeVocabWidget.stories.ts`** - Features/PracticeVocabWidget
    - Stories: Different difficulty levels, Various languages, Error states, Success states
    
12. **`MetaExerciseRenderer.stories.ts`** - Features/MetaExerciseRenderer  
    - Stories: All exercise types (ChooseFromFour, ChooseFromTwo, Reveal, TryToRemember)
    - Complex: Multi-language, Different difficulty, Edge cases

#### Individual Exercise Components
13. **`ChooseFromFour.stories.ts`** - Features/ChooseFromFour
    - Stories: Different languages, Correct/incorrect states, Loading
    
14. **`ChooseFromTwo.stories.ts`** - Features/ChooseFromTwo
    - Stories: Binary choices, Different content types, State variations
    
15. **`Reveal.stories.ts`** - Features/Reveal
    - Stories: Hidden/revealed states, Different content lengths, Interactive flow
    
16. **`TryToRemember.stories.ts`** - Features/TryToRemember  
    - Stories: Different vocabulary difficulty, Hint states, Success/failure flows

#### Renderer Components
17. **`ImmersionContentFormRenderer.stories.ts`** - Features/ImmersionContentFormRenderer
    - Stories: All form states, Validation, Different content types
    
18. **`VocabFormRenderer.stories.ts`** - Features/VocabFormRenderer
    - Stories: All input states, With/without pronunciation, Validation feedback
    
19. **`VocabListRenderer.stories.ts`** - Features/VocabListRenderer
    - Stories: Grid/list views, Different vocab data, Empty states, Pagination UI

### Widgets Directory - All Stories Complete ✅

All widget stories are already implemented.

## Story Creation Priorities

### Phase 1: High Priority (Core User Flows)
1. `PracticeVocabWidget.stories.ts` - Core learning functionality
2. `MetaExerciseRenderer.stories.ts` - Exercise system foundation  
3. `VocabFormController.stories.ts` - Vocab management
4. `ImmersionContentFormController.stories.ts` - Content management

### Phase 2: Medium Priority (Management Features)
5. `ManageVocabOfGoalWidget.stories.ts` - Goal-vocab association
6. `ManageExamplesOfGoalWidget.stories.ts` - Example management
7. `VocabListController.stories.ts` - Vocab browsing
8. `ImmersionContentListWidget.stories.ts` - Content browsing

### Phase 3: Lower Priority (Individual Components)  
9-19. Individual exercise components and renderers

## Story Structure Guidelines

Based on analysis of existing stories (e.g., `DoTaskWidget.stories.ts`), follow these patterns:

### File Structure
```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import ComponentName from '@/features/path/ComponentName.vue';

const meta: Meta<typeof ComponentName> = {
  title: 'Features/ComponentName', // or 'Widgets/ComponentName'
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Clear component description',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define prop controls
  },
  decorators: [
    // Responsive wrapper for complex components
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;
```

### Story Variants to Include
1. **Default** - Basic usage
2. **Loading States** - Show loading/pending states  
3. **Error States** - Error handling and validation
4. **Empty States** - No data scenarios
5. **Populated** - With realistic data
6. **Edge Cases** - Long text, special characters, multiple languages
7. **Interactive** - User interaction demonstrations

### Multi-language Testing
Include stories with:
- English (default)
- Spanish (accent marks, special characters)
- German (long compound words, umlauts)
- Japanese (unicode, different writing systems)
- Arabic (RTL support testing)

### Responsive Testing
- Mobile-first approach
- Tablet breakpoints  
- Desktop layouts
- Text overflow handling

## Implementation Notes

### Mocking Dependencies
Many components require dependency injection (repositories, services). Use Storybook's `decorators` to provide mocks:

```typescript
decorators: [
  (story) => ({
    components: { story },
    provide: {
      vocabRepo: mockVocabRepo,
      goalRepo: mockGoalRepo,
    },
    template: '<story />',
  }),
],
```

### Data Fixtures
Create realistic test data representing:
- Different vocabulary mastery levels
- Various goal types and completion states  
- Multiple language combinations
- Different content types (text, audio, images)

### Accessibility Testing
Each story should demonstrate:
- Keyboard navigation
- Screen reader compatibility  
- Color contrast compliance
- Focus management

## Success Criteria

### Story Completeness
- [ ] All 19 missing feature stories created
- [ ] Each story has 3-7 meaningful variants
- [ ] Props/events properly documented with argTypes
- [ ] Interactive demos where applicable

### Quality Standards
- [ ] Responsive design demonstrated
- [ ] Multi-language support shown
- [ ] Loading/error states covered
- [ ] Accessibility considerations included
- [ ] Mock data is realistic and varied

### Documentation
- [ ] Component descriptions explain purpose and usage
- [ ] Story descriptions clarify the demonstrated scenario
- [ ] Integration points with other components noted
- [ ] Dependencies and injection requirements documented

This plan ensures comprehensive Storybook coverage for the entire Linguanodon application, supporting both development workflow and component documentation needs.