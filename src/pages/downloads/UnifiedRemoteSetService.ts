import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';

import { vocabSchema } from '@/entities/remote-sets/validation/vocabSchema';
import { translationSchema } from '@/entities/remote-sets/validation/translationSchema';
import { noteSchema } from '@/entities/remote-sets/validation/noteSchema';
import { linkSchema } from '@/entities/remote-sets/validation/linkSchema';
import { resourceSchema } from '@/entities/remote-sets/validation/resourceSchema';
import { immersionContentSchema } from '@/entities/remote-sets/validation/immersionContentSchema';
import { goalSchema } from '@/entities/remote-sets/validation/goalSchema';
import { factCardSchema } from '@/entities/remote-sets/validation/factCardSchema';

import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { GoalData } from '@/entities/goals/GoalData';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Link } from '@/shared/links/Link';

import { z } from 'zod';

interface RemoteSetFiles {
  vocab?: z.infer<typeof vocabSchema>[];
  translations?: z.infer<typeof translationSchema>[];
  notes?: z.infer<typeof noteSchema>[];
  links?: z.infer<typeof linkSchema>[];
  resources?: z.infer<typeof resourceSchema>[];
  immersionContent?: z.infer<typeof immersionContentSchema>[];
  goals?: z.infer<typeof goalSchema>[];
  factCards?: z.infer<typeof factCardSchema>[];
}

export class UnifiedRemoteSetService {
  constructor(
    private localSetRepo: LocalSetRepoContract,
    private vocabRepo: VocabRepoContract,
    private translationRepo: TranslationRepoContract,
    private noteRepo: NoteRepoContract,
    private resourceRepo: ResourceRepoContract,
    private immersionContentRepo: ImmersionContentRepoContract,
    private goalRepo: GoalRepoContract,
    private factCardRepo: FactCardRepoContract
  ) {}

  async getAvailableLanguages(): Promise<string[]> {
    try {
      const response = await fetch('/sets/index.json');
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch available languages:', error);
      return [];
    }
  }

  async getAvailableSets(languageCode: string): Promise<string[]> {
    try {
      const response = await fetch(`/sets/${languageCode}/index.json`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch sets for ${languageCode}:`, error);
      return [];
    }
  }

  async downloadSet(languageCode: string, setName: string): Promise<void> {
    // First validate all files before writing anything
    const setFiles = await this.loadAndValidateSetFiles(languageCode, setName);
    if (!setFiles) {
      throw new Error('Failed to validate set files');
    }

    // Create or update local set entry
    const localSet = await this.localSetRepo.saveLocalSet({
      name: setName,
      language: languageCode,
      description: `Unified set: ${setName}`,
      lastDownloadedAt: new Date()
    });

    // Create lookup maps for resolving references
    const linkMap = new Map<string, Link>();
    const noteMap = new Map<string, string>(); // remote ID -> local UID
    const translationMap = new Map<string, string>(); // remote ID -> local UID
    const vocabMap = new Map<string, string>(); // remote ID -> local UID
    const resourceMap = new Map<string, string>(); // remote ID -> local UID
    const immersionContentMap = new Map<string, string>(); // remote ID -> local UID
    const goalMap = new Map<string, string>(); // remote ID -> local UID
    const factCardMap = new Map<string, string>(); // remote ID -> local UID

    // Track newly created entities for task generation
    const newVocabUids: string[] = [];
    const newResourceUids: string[] = [];
    const newGoalUids: string[] = [];

    // Process links first (they're embedded, not stored as entities)
    if (setFiles.links) {
      for (const linkData of setFiles.links) {
        if (linkData.id) {
          linkMap.set(linkData.id, {
            label: linkData.label,
            url: linkData.url,
            owner: linkData.owner,
            ownerLink: linkData.ownerLink,
            license: linkData.license
          });
        }
      }
    }

    // Process notes 
    if (setFiles.notes) {
      for (const noteData of setFiles.notes) {
        // Always create new notes (as per instructions - don't share notes)
        const localNote: Omit<NoteData, 'uid'> = {
          content: noteData.content,
          showBeforeExercise: noteData.showBeforeExercice || false,
          noteType: noteData.noteType || 'general'
        };
        const savedNote = await this.noteRepo.saveNote(localNote);
        if (noteData.id) {
          noteMap.set(noteData.id, savedNote.uid);
        }
      }
    }

    // Process translations
    if (setFiles.translations) {
      for (const translationData of setFiles.translations) {
        if (!translationData.content) continue;
        const existingTranslation = await this.translationRepo.getTranslationByContent(translationData.content);
        
        if (existingTranslation) {
          // Add new origin if not already present
          const existingOrigins = new Set(existingTranslation.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          // Resolve note references and merge
          const noteUids = this.resolveReferences(translationData.notes || [], noteMap);
          const mergedNotes = [...new Set([...existingTranslation.notes, ...noteUids])];
          
          await this.translationRepo.updateTranslation({
            ...existingTranslation,
            notes: mergedNotes,
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingTranslation.priority ?? 0) + (translationData.priority || 1) : existingTranslation.priority
          });
          
          if (translationData.id) {
            translationMap.set(translationData.id, existingTranslation.uid);
          }
        } else {
          const noteUids = this.resolveReferences(translationData.notes || [], noteMap);
          const localTranslation: Omit<TranslationData, 'uid' | 'origins'> = {
            content: translationData.content,
            priority: translationData.priority || 1,
            notes: noteUids
          };
          
          const savedTranslation = await this.translationRepo.saveTranslation(localTranslation);
          if (translationData.id) {
            translationMap.set(translationData.id, savedTranslation.uid);
          }
        }
      }
    }

    // Process vocab
    if (setFiles.vocab) {
      for (const vocabData of setFiles.vocab) {
        if (!vocabData.language) continue;
        
        let existingVocab: VocabData | undefined;
        
        if (vocabData.content) {
          // Match by content + language
          existingVocab = await this.vocabRepo.getVocabByLanguageAndContent(
            vocabData.language,
            vocabData.content
          );
        } else {
          // Match by checking if all remote translations are present in local vocab
          const translationUids = this.resolveReferences(vocabData.translations || [], translationMap);
          if (translationUids.length > 0) {
            existingVocab = await this.vocabRepo.findVocabByTranslationUids(
              vocabData.language,
              translationUids
            );
          }
        }

        if (existingVocab) {
          // Merge with existing vocab
          const existingOrigins = new Set(existingVocab.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          // Resolve all references and merge arrays
          const noteUids = this.resolveReferences(vocabData.notes || [], noteMap);
          const translationUids = this.resolveReferences(vocabData.translations || [], translationMap);
          const links = this.resolveLinks(vocabData.links || [], linkMap);
          const relatedVocabUids = this.resolveReferences(vocabData.relatedVocab || [], vocabMap);
          const notRelatedVocabUids = this.resolveReferences(vocabData.notRelatedVocab || [], vocabMap);
          
          await this.vocabRepo.updateVocab({
            ...existingVocab,
            notes: [...new Set([...existingVocab.notes, ...noteUids])],
            translations: [...new Set([...existingVocab.translations, ...translationUids])],
            links: [...existingVocab.links, ...links],
            relatedVocab: [...new Set([...existingVocab.relatedVocab, ...relatedVocabUids])],
            notRelatedVocab: [...new Set([...existingVocab.notRelatedVocab, ...notRelatedVocabUids])],
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingVocab.priority ?? 0) + (vocabData.priority || 1) : existingVocab.priority
          });
          
          if (vocabData.id) {
            vocabMap.set(vocabData.id, existingVocab.uid);
          }
        } else {
          // Create new vocab
          const noteUids = this.resolveReferences(vocabData.notes || [], noteMap);
          const translationUids = this.resolveReferences(vocabData.translations || [], translationMap);
          const links = this.resolveLinks(vocabData.links || [], linkMap);
          
          const localVocab: Omit<VocabData, 'uid' | 'progress' | 'tasks'> = {
            language: vocabData.language,
            content: vocabData.content,
            length: vocabData.length || 'not-specified',
            priority: vocabData.priority || 1,
            doNotPractice: false, // Default value since remote schema doesn't have this
            notes: noteUids,
            translations: translationUids,
            links: links,
            relatedVocab: [], // Will resolve in second pass
            notRelatedVocab: [], // Will resolve in second pass
            origins: [localSet.uid]
          };
          
          const savedVocab = await this.vocabRepo.saveVocab(localVocab);
          newVocabUids.push(savedVocab.uid);
          if (vocabData.id) {
            vocabMap.set(vocabData.id, savedVocab.uid);
          }
        }
      }
      
      // Second pass to resolve vocab-to-vocab relationships
      for (const vocabData of setFiles.vocab) {
        if (!vocabData.id) continue;
        const vocabUid = vocabMap.get(vocabData.id);
        if (vocabUid) {
          const relatedVocabUids = this.resolveReferences(vocabData.relatedVocab || [], vocabMap);
          const notRelatedVocabUids = this.resolveReferences(vocabData.notRelatedVocab || [], vocabMap);
          
          if (relatedVocabUids.length > 0 || notRelatedVocabUids.length > 0) {
            const vocab = await this.vocabRepo.getVocabByUID(vocabUid);
            if (vocab) {
              await this.vocabRepo.updateVocab({
                ...vocab,
                relatedVocab: [...new Set([...vocab.relatedVocab, ...relatedVocabUids])],
                notRelatedVocab: [...new Set([...vocab.notRelatedVocab, ...notRelatedVocabUids])]
              });
            }
          }
        }
      }
    }

    // Task generation is now handled ad-hoc during lessons

    // Process fact cards
    if (setFiles.factCards) {
      for (const factCardData of setFiles.factCards) {
        // Check if fact card already exists by front+back+language
        const allFactCards = await this.factCardRepo.getAllFactCards();
        const existingFactCard = allFactCards.find(fc => 
          fc.front === factCardData.front && 
          fc.back === factCardData.back && 
          fc.language === factCardData.language
        );

        if (existingFactCard) {
          // Merge with existing fact card
          const existingOrigins = new Set(existingFactCard.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          const noteUids = this.resolveReferences(factCardData.notes || [], noteMap);
          
          await this.factCardRepo.updateFactCard({
            ...existingFactCard,
            notes: [...new Set([...existingFactCard.notes, ...noteUids])],
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingFactCard.priority ?? 0) + (factCardData.priority || 1) : existingFactCard.priority
          });
          
          if (factCardData.id) {
            factCardMap.set(factCardData.id, existingFactCard.uid);
          }
        } else {
          const noteUids = this.resolveReferences(factCardData.notes || [], noteMap);
          
          const localFactCard: Omit<FactCardData, 'uid' | 'progress'> = {
            language: factCardData.language,
            front: factCardData.front,
            back: factCardData.back,
            priority: factCardData.priority || 1,
            doNotPractice: false,
            notes: noteUids,
            origins: [localSet.uid]
          };
          
          const savedFactCard = await this.factCardRepo.saveFactCard(localFactCard);
          if (factCardData.id) {
            factCardMap.set(factCardData.id, savedFactCard.uid);
          }
        }
      }
    }

    // Process resources
    if (setFiles.resources) {
      for (const resourceData of setFiles.resources) {
        const existingResource = await this.resourceRepo.getResourceByTitleAndLanguage(
          resourceData.title,
          resourceData.language
        );

        if (existingResource) {
          // Merge with existing resource
          const existingOrigins = new Set(existingResource.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          const noteUids = this.resolveReferences(resourceData.notes || [], noteMap);
          
          await this.resourceRepo.updateResource({
            ...existingResource,
            notes: [...new Set([...existingResource.notes, ...noteUids])],
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingResource.priority ?? 0) + (resourceData.priority || 1) : existingResource.priority
          });
          
          if (resourceData.id) {
            resourceMap.set(resourceData.id, existingResource.uid);
          }
        } else {
          const noteUids = this.resolveReferences(resourceData.notes || [], noteMap);
          const link = resourceData.link ? linkMap.get(resourceData.link) : undefined;
          
          const localResource: Omit<ResourceData, 'uid' | 'lastShownAt'> = {
            language: resourceData.language,
            title: resourceData.title,
            content: resourceData.content,
            priority: resourceData.priority || 1,
            link: link,
            notes: noteUids,
            vocab: [],
            factCards: [],
            origins: [localSet.uid],
            finishedExtracting: false
          };
          
          const savedResource = await this.resourceRepo.saveResource(localResource);
          newResourceUids.push(savedResource.uid);
          if (resourceData.id) {
            resourceMap.set(resourceData.id, savedResource.uid);
          }
        }
      }
    }

    // Task generation is now handled ad-hoc during lessons

    // Process immersion content
    if (setFiles.immersionContent) {
      for (const immersionData of setFiles.immersionContent) {
        const existingImmersion = await this.immersionContentRepo.getImmersionContentByTitleAndLanguage(
          immersionData.title,
          immersionData.language
        );

        if (existingImmersion) {
          // Merge with existing immersion content
          const existingOrigins = new Set(existingImmersion.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          const noteUids = this.resolveReferences(immersionData.notes || [], noteMap);
          const neededVocabUids = this.resolveReferences(immersionData.neededVocab || [], vocabMap);
          
          await this.immersionContentRepo.updateImmersionContent({
            ...existingImmersion,
            notes: [...new Set([...existingImmersion.notes, ...noteUids])],
            neededVocab: [...new Set([...existingImmersion.neededVocab, ...neededVocabUids])],
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingImmersion.priority ?? 0) + (immersionData.priority || 1) : existingImmersion.priority
          });
          
          if (immersionData.id) {
            immersionContentMap.set(immersionData.id, existingImmersion.uid);
          }
        } else {
          const noteUids = this.resolveReferences(immersionData.notes || [], noteMap);
          const neededVocabUids = this.resolveReferences(immersionData.neededVocab || [], vocabMap);
          const link = immersionData.link ? linkMap.get(immersionData.link) : undefined;
          
          const localImmersion: Omit<ImmersionContentData, 'uid' | 'lastShownAt'> = {
            language: immersionData.language,
            title: immersionData.title,
            content: immersionData.content,
            priority: immersionData.priority || 1,
            link: link,
            notes: noteUids,
            neededVocab: neededVocabUids,
            extractedVocab: [],
            extractedFactCards: [],
            origins: [localSet.uid],
            finishedExtracting: false
          };
          
          const savedImmersion = await this.immersionContentRepo.saveImmersionContent(localImmersion);
          if (immersionData.id) {
            immersionContentMap.set(immersionData.id, savedImmersion.uid);
          }
        }
      }
    }

    // Process goals
    if (setFiles.goals) {
      for (const goalData of setFiles.goals) {
        // Check if goal already exists by title+language
        const allGoals = await this.goalRepo.getAll();
        const existingGoal = allGoals.find(g => 
          g.title === goalData.title && 
          g.language === goalData.language
        );

        if (existingGoal) {
          // Merge with existing goal
          const existingOrigins = new Set(existingGoal.origins || []);
          existingOrigins.add(localSet.uid);
          
          const noteUids = this.resolveReferences(goalData.notes || [], noteMap);
          const vocabUids = this.resolveReferences(goalData.vocab || [], vocabMap);
          const factCardUids = this.resolveReferences(goalData.factCards || [], factCardMap);
          const subGoalUids = this.resolveReferences(goalData.subGoals || [], goalMap);
          
          await this.goalRepo.update(existingGoal.uid, {
            notes: [...new Set([...existingGoal.notes, ...noteUids])],
            vocab: [...new Set([...existingGoal.vocab, ...vocabUids])],
            factCards: [...new Set([...existingGoal.factCards, ...factCardUids])],
            subGoals: [...new Set([...existingGoal.subGoals, ...subGoalUids])],
            origins: [...existingOrigins]
          });
          
          if (goalData.id) {
            goalMap.set(goalData.id, existingGoal.uid);
          }
        } else {
          const noteUids = this.resolveReferences(goalData.notes || [], noteMap);
          const vocabUids = this.resolveReferences(goalData.vocab || [], vocabMap);
          const factCardUids = this.resolveReferences(goalData.factCards || [], factCardMap);
          const subGoalUids = this.resolveReferences(goalData.subGoals || [], goalMap);
          
          const localGoal: Omit<GoalData, 'uid'> = {
            language: goalData.language,
            title: goalData.title,
            notes: noteUids,
            vocab: vocabUids,
            factCards: factCardUids,
            subGoals: subGoalUids,
            origins: [localSet.uid],
            finishedAddingSubGoals: false,
            finishedAddingMilestones: false,
            finishedAddingKnowledge: false,
            milestones: {}
          };
          
          const savedGoal = await this.goalRepo.create(localGoal);
          newGoalUids.push(savedGoal.uid);
          if (goalData.id) {
            goalMap.set(goalData.id, savedGoal.uid);
          }
        }
      }
    }

    // Task generation is now handled ad-hoc during lessons
  }

  private async loadAndValidateSetFiles(languageCode: string, setName: string): Promise<RemoteSetFiles | null> {
    const possibleFiles = ['vocab', 'translations', 'notes', 'links', 'resources', 'immersionContent', 'goals', 'factCards'];
    const setFiles: RemoteSetFiles = {};

    for (const fileName of possibleFiles) {
      try {
        const response = await fetch(`/sets/${languageCode}/${setName}/${fileName}.jsonl`);
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`${fileName}.jsonl not found, skipping`);
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Check content type - should be text/plain or application/json for JSONL
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          console.log(`${fileName}.jsonl returned HTML content type, skipping (file doesn't exist)`);
          continue;
        }
        
        if (response.ok) {
          const text = await response.text();
          const lines = text.trim().split('\n').filter(line => line.trim());
          
          // Skip empty files
          if (lines.length === 0) {
            continue;
          }
          
          // Get the appropriate schema for validation
          const schema = this.getSchemaForFile(fileName);
          if (!schema) {
            console.warn(`No schema found for ${fileName}.jsonl`);
            continue;
          }

          const data = lines.map(line => {
            try {
              const parsed: unknown = JSON.parse(line);
              const result = schema.safeParse(parsed);
              if (result.success) {
                return result.data;
              } else {
                console.warn(`Validation failed for line in ${fileName}.jsonl:`, result.error);
                return null;
              }
            } catch {
              console.warn(`Failed to parse JSON line in ${fileName}.jsonl:`, line);
              return null;
            }
          }).filter(item => item !== null);
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setFiles[fileName as keyof RemoteSetFiles] = data as any;
        }
      } catch (error) {
        console.error(`Failed to load ${fileName}.jsonl:`, error);
        return null;
      }
    }

    return setFiles;
  }

  private getSchemaForFile(fileName: string) {
    const schemaMap = {
      vocab: vocabSchema,
      translations: translationSchema,
      notes: noteSchema,
      links: linkSchema,
      resources: resourceSchema,
      immersionContent: immersionContentSchema,
      goals: goalSchema,
      factCards: factCardSchema
    };
    return schemaMap[fileName as keyof typeof schemaMap];
  }

  private resolveReferences(remoteIds: string[], referenceMap: Map<string, string>): string[] {
    const resolvedUids: string[] = [];
    for (const remoteId of remoteIds) {
      const localUid = referenceMap.get(remoteId);
      if (localUid) {
        resolvedUids.push(localUid);
      } else {
        console.warn(`Reference not found for ID: ${remoteId}`);
      }
    }
    return [...new Set(resolvedUids)]; // Remove duplicates
  }

  private resolveLinks(remoteIds: string[], linkMap: Map<string, Link>): Link[] {
    const resolvedLinks: Link[] = [];
    for (const remoteId of remoteIds) {
      const link = linkMap.get(remoteId);
      if (link) {
        resolvedLinks.push(link);
      } else {
        console.warn(`Link not found for ID: ${remoteId}`);
      }
    }
    return resolvedLinks;
  }

  async isSetDownloaded(setName: string): Promise<boolean> {
    return await this.localSetRepo.isRemoteSetDownloaded(setName);
  }

  async getDownloadedSets(): Promise<LocalSetData[]> {
    return await this.localSetRepo.getAllLocalSets();
  }
}