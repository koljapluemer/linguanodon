import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { randomBetween, pickRandom, randomFromArray } from '@/shared/arrayUtils';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';

// Configuration constants
const MIN_TASK_COUNT = 5;
const MAX_TASK_COUNT = 17;
const MIN_UNSEEN_VOCAB = 1;
const MAX_UNSEEN_VOCAB = 3;
const LOW_MASTERY_THRESHOLD = 20; // Below 20% average mastery

export async function makeLessonAroundLowMasteryImmersionContent(
  vocabRepo: VocabAndTranslationRepoContract,
  taskRepo: TaskRepoContract,
  immersionContentRepo: ImmersionContentRepoContract,
  languages: string[]
): Promise<TaskData[]> {
  
  const tasks: TaskData[] = [];
  
  try {
    console.log('Starting makeLessonAroundLowMasteryImmersionContent');
    
    // Decide on number of tasks (5-17)
    const targetTaskCount = randomBetween(MIN_TASK_COUNT, MAX_TASK_COUNT);
    
    // Find immersion content with low average mastery and no tasks attached
    const allImmersionContent = await immersionContentRepo.getAllImmersionContent();
    const eligibleContent = [];
    
    for (const content of allImmersionContent) {
      // Skip if not in target languages or has tasks attached
      if (!languages.includes(content.language) || content.tasks.length > 0) {
        continue;
      }
      
      // Calculate average mastery for this content
      if (content.neededVocab.length === 0) {
        continue; // Skip content with no needed vocab
      }
      
      const neededVocab = await Promise.all(
        content.neededVocab.map(id => vocabRepo.getVocabByUID(id))
      );
      const validNeededVocab = neededVocab.filter(vocab => vocab !== undefined);
      
      if (validNeededVocab.length === 0) {
        continue;
      }
      
      // Calculate average mastery
      const totalMastery = validNeededVocab.reduce((sum, vocab) => {
        return sum + calculateVocabMastery(vocab);
      }, 0);
      const averageMastery = totalMastery / validNeededVocab.length;
      
      // Include if average mastery is below threshold
      if (averageMastery < LOW_MASTERY_THRESHOLD) {
        eligibleContent.push(content);
      }
    }
    
    if (eligibleContent.length === 0) {
      console.warn('No low mastery immersion content available without tasks for languages:', languages);
      return [];
    }
    
    const selectedContent = randomFromArray(eligibleContent);
    if (!selectedContent) {
      console.warn('Failed to select low mastery immersion content');
      return [];
    }
    
    console.log('Selected low mastery immersion content:', selectedContent.title, selectedContent.uid);
    
    // Check neededVocab for this immersion content
    const neededVocabIds = selectedContent.neededVocab;
    
    // Get all needed vocab items
    const neededVocab = await Promise.all(
      neededVocabIds.map(id => vocabRepo.getVocabByUID(id))
    );
    const validNeededVocab = neededVocab.filter(vocab => vocab !== undefined);
    
    // Separate unseen and seen vocab
    const unseenVocab = validNeededVocab.filter(vocab => vocab.progress.level <= 0);
    const seenVocab = validNeededVocab.filter(vocab => vocab.progress.level > 0);
    
    // Track used vocab IDs to prevent duplicates
    const usedVocabIds = new Set<string>();
    
    // Filter due vocab from seen vocab by checking individual due dates
    const validDueSeenVocab = seenVocab.filter(vocab => 
      vocab.progress.due <= new Date() && !vocab.doNotPractice
    );
    
    // 1. If we have unseen vocab, pick 1-3 randomly and add their tasks
    if (unseenVocab.length > 0) {
      const unseenCount = randomBetween(MIN_UNSEEN_VOCAB, Math.min(MAX_UNSEEN_VOCAB, unseenVocab.length));
      const selectedUnseenVocab = pickRandom(unseenVocab, unseenCount);
      
      for (const vocab of selectedUnseenVocab) {
        if (usedVocabIds.has(vocab.uid) || tasks.length >= targetTaskCount) continue;
        
        try {
          const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
          const activeTasks = vocabTasks.filter(task => task.isActive);
          
          if (activeTasks.length > 0) {
            const randomTask = randomFromArray(activeTasks);
            if (randomTask) {
              tasks.push(randomTask);
              usedVocabIds.add(vocab.uid);
            }
          }
        } catch (error) {
          console.warn('Error loading tasks for unseen vocab:', vocab.uid, error);
        }
      }
    }
    
    // 2. Add due seen vocab from needed vocab until we hit task limit
    if (tasks.length < targetTaskCount && validDueSeenVocab.length > 0) {
      const availableDueVocab = validDueSeenVocab.filter(vocab => !usedVocabIds.has(vocab.uid));
      const remainingSlots = targetTaskCount - tasks.length;
      const selectedDueVocab = pickRandom(availableDueVocab, remainingSlots);
      
      for (const vocab of selectedDueVocab) {
        if (tasks.length >= targetTaskCount) break;
        
        try {
          const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
          const activeTasks = vocabTasks.filter(task => task.isActive);
          
          if (activeTasks.length > 0) {
            const randomTask = randomFromArray(activeTasks);
            if (randomTask) {
              tasks.push(randomTask);
              usedVocabIds.add(vocab.uid);
            }
          }
        } catch (error) {
          console.warn('Error loading tasks for due seen vocab:', vocab.uid, error);
        }
      }
    }
    
    // 3. If we haven't hit the task limit, fill up with random due seen vocab from whole db
    if (tasks.length < targetTaskCount) {
      const remainingSlots = targetTaskCount - tasks.length;
      const globalDueVocab = await vocabRepo.getDueVocabInLanguages(languages);
      
      // Filter out vocab we already used
      const availableDueVocab = globalDueVocab.filter(vocab => !usedVocabIds.has(vocab.uid));
      
      if (availableDueVocab.length > 0) {
        const selectedGlobalVocab = pickRandom(availableDueVocab, remainingSlots);
        
        for (const vocab of selectedGlobalVocab) {
          if (tasks.length >= targetTaskCount) break;
          
          try {
            const vocabTasks = await taskRepo.getTasksByVocabId(vocab.uid);
            const activeTasks = vocabTasks.filter(task => task.isActive);
            
            if (activeTasks.length > 0) {
              const randomTask = randomFromArray(activeTasks);
              if (randomTask) {
                tasks.push(randomTask);
                usedVocabIds.add(vocab.uid);
              }
            }
          } catch (error) {
            console.warn('Error loading tasks for global due vocab:', vocab.uid, error);
          }
        }
      }
    }
    
    console.log(`Generated ${tasks.length} tasks based on low mastery immersion content: ${selectedContent.title}`);
    return tasks;
    
  } catch (error) {
    console.warn('Error in makeLessonAroundLowMasteryImmersionContent:', error);
    return [];
  }
}