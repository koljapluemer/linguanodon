import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';

import { vocabSchema } from '@/entities/remote-sets/validation/vocabSchema';
import { translationSchema } from '@/entities/remote-sets/validation/translationSchema';
import { noteSchema } from '@/entities/remote-sets/validation/noteSchema';
import { linkSchema } from '@/entities/remote-sets/validation/linkSchema';
import { resourceSchema } from '@/entities/remote-sets/validation/resourceSchema';
import { goalSchema } from '@/entities/remote-sets/validation/goalSchema';
import { factCardSchema } from '@/entities/remote-sets/validation/factCardSchema';

import type { VocabData, VocabImage, VocabSound } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { GoalData } from '@/entities/goals/GoalData';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Link } from '@/shared/links/Link';

import { z } from 'zod';
import { remoteSetMetaDataSchema } from '@/entities/remote-sets/remoteSetMetaData';

export interface RemoteSetInfo {
  name: string;
  title?: string;
}

export interface DownloadProgress {
  phase: string;
  current: number;
  total: number;
  percentage: number;
}

export interface DownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
}

interface RemoteSetFiles {
  vocab?: z.infer<typeof vocabSchema>[];
  translations?: z.infer<typeof translationSchema>[];
  notes?: z.infer<typeof noteSchema>[];
  links?: z.infer<typeof linkSchema>[];
  resources?: z.infer<typeof resourceSchema>[];
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
    private goalRepo: GoalRepoContract,
    private factCardRepo: FactCardRepoContract,
    private languageRepo: LanguageRepoContract
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

  async getAvailableSets(languageCode: string): Promise<RemoteSetInfo[]> {
    try {
      const response = await fetch(`/sets/${languageCode}/index.json`);
      if (!response.ok) return [];
      const setNames: string[] = await response.json();
      
      // Fetch metadata for each set
      const setsWithMetadata = await Promise.all(
        setNames.map(async (setName) => {
          const metadata = await this.getSetMetadata(languageCode, setName);
          return {
            name: setName,
            title: metadata?.title
          };
        })
      );
      
      return setsWithMetadata;
    } catch (error) {
      console.error(`Failed to fetch sets for ${languageCode}:`, error);
      return [];
    }
  }

  async getSetMetadata(languageCode: string, setName: string): Promise<z.infer<typeof remoteSetMetaDataSchema> | null> {
    try {
      const response = await fetch(`/sets/${languageCode}/${setName}/metadata.json`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const result = remoteSetMetaDataSchema.safeParse(data);
      
      if (result.success) {
        return result.data;
      } else {
        console.warn(`Invalid metadata format for ${languageCode}/${setName}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Failed to fetch metadata for ${languageCode}/${setName}:`, error);
      return null;
    }
  }

  async downloadSet(languageCode: string, setName: string, options?: DownloadOptions): Promise<void> {
    const reportProgress = (phase: string, current: number, total: number) => {
      if (options?.onProgress) {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        options.onProgress({ phase, current, total, percentage });
      }
    };

    reportProgress('Loading and validating files', 0, 100);
    
    // First validate all files before writing anything
    const setFiles = await this.loadAndValidateSetFiles(languageCode, setName);
    if (!setFiles) {
      throw new Error('Failed to validate set files');
    }

    reportProgress('Loading and validating files', 100, 100);

    reportProgress('Setting up language and local set', 0, 100);
    
    // Ensure language exists in the database as active (only if not already present)
    const existingLanguage = await this.languageRepo.getByCode(languageCode);
    if (!existingLanguage) {
      const newLanguage = await this.languageRepo.createLanguageFromCode(languageCode);
      await this.languageRepo.add(newLanguage);
    }

    // Create or update local set entry
    const localSet = await this.localSetRepo.saveLocalSet({
      name: setName,
      language: languageCode,
      description: `Unified set: ${setName}`,
      lastDownloadedAt: new Date()
    });

    reportProgress('Setting up language and local set', 100, 100);

    // Create lookup maps for resolving references
    const linkMap = new Map<string, Link>();
    const noteMap = new Map<string, string>(); // remote ID -> local UID
    const translationMap = new Map<string, string>(); // remote ID -> local UID
    const vocabMap = new Map<string, string>(); // remote ID -> local UID
    const resourceMap = new Map<string, string>(); // remote ID -> local UID
    const goalMap = new Map<string, string>(); // remote ID -> local UID
    const factCardMap = new Map<string, string>(); // remote ID -> local UID

    // Track newly created entities for task generation
    const newVocabUids: string[] = [];
    const newResourceUids: string[] = [];
    const newGoalUids: string[] = [];

    reportProgress('Processing links and notes', 0, 100);
    
    // Process links first (they're embedded, not stored as entities)
    if (setFiles.links) {
      for (let i = 0; i < setFiles.links.length; i++) {
        const linkData = setFiles.links[i];
        reportProgress('Processing links', i, setFiles.links.length);
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
      for (let i = 0; i < setFiles.notes.length; i++) {
        const noteData = setFiles.notes[i];
        reportProgress('Processing notes', i, setFiles.notes.length);
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
      for (let i = 0; i < setFiles.translations.length; i++) {
        const translationData = setFiles.translations[i];
        reportProgress('Processing translations', i, setFiles.translations.length);
        if (!translationData.content) continue;
        const existingTranslation = await this.translationRepo.getTranslationByContent(translationData.content);
        
        if (existingTranslation) {
          // Add new origin if not already present
          const existingOrigins = new Set(existingTranslation.origins || []);
          const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
          
          existingOrigins.add(localSet.uid);
          
          // Resolve note references and merge with deduplication
          const noteUids = this.resolveReferences(translationData.notes || [], noteMap);
          const mergedNotes = await this.deduplicateEntityNotes([...existingTranslation.notes, ...noteUids]);
          
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
          const deduplicatedNotes = await this.deduplicateEntityNotes(noteUids);
          const localTranslation: Omit<TranslationData, 'uid' | 'origins'> = {
            content: translationData.content,
            priority: translationData.priority || 1,
            notes: deduplicatedNotes
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
      for (let i = 0; i < setFiles.vocab.length; i++) {
        const vocabData = setFiles.vocab[i];
        reportProgress('Processing vocabulary', i, setFiles.vocab.length);
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
          
          // Resolve all references and merge arrays with deduplication
          const noteUids = this.resolveReferences(vocabData.notes || [], noteMap);
          const translationUids = this.resolveReferences(vocabData.translations || [], translationMap);
          const links = this.resolveLinks(vocabData.links || [], linkMap);
          const relatedVocabUids = this.resolveReferences(vocabData.relatedVocab || [], vocabMap);
          const notRelatedVocabUids = this.resolveReferences(vocabData.notRelatedVocab || [], vocabMap);
          
          const deduplicatedNotes = await this.deduplicateEntityNotes([...existingVocab.notes, ...noteUids]);
          
          await this.vocabRepo.updateVocab({
            ...existingVocab,
            notes: deduplicatedNotes,
            translations: [...new Set([...existingVocab.translations, ...translationUids])],
            links: this.deduplicateLinks([...existingVocab.links, ...links]),
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
          
          const deduplicatedNotes = await this.deduplicateEntityNotes(noteUids);
          
          const localVocab: Omit<VocabData, 'uid' | 'progress'> = {
            language: vocabData.language,
            content: vocabData.content,
            consideredCharacter: vocabData.consideredCharacter,
            consideredSentence: vocabData.consideredSentence,
            consideredWord: vocabData.consideredWord,
            priority: vocabData.priority || 1,
            doNotPractice: false, // Default value since remote schema doesn't have this
            notes: deduplicatedNotes,
            translations: translationUids,
            links: links,
            relatedVocab: [], // Will resolve in second pass
            notRelatedVocab: [], // Will resolve in second pass
            origins: [localSet.uid],
            isPicturable: vocabData.isPicturable,
            notInterestedInPronunciationOrAlreadyAdded: vocabData.notInterestedInPronunciationOrAlreadyAdded
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

    // Process media files for vocab that was just created
    if (setFiles.vocab) {
      reportProgress('Processing media files', 0, 100);
      await this.processVocabMedia(languageCode, setName, setFiles.vocab, vocabMap);
      reportProgress('Processing media files', 100, 100);
    }

    // Task generation is now handled ad-hoc during lessons

    // Process fact cards
    if (setFiles.factCards) {
      for (let i = 0; i < setFiles.factCards.length; i++) {
        const factCardData = setFiles.factCards[i];
        reportProgress('Processing fact cards', i, setFiles.factCards.length);
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
          const deduplicatedNotes = await this.deduplicateEntityNotes([...existingFactCard.notes, ...noteUids]);
          
          await this.factCardRepo.updateFactCard({
            ...existingFactCard,
            notes: deduplicatedNotes,
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingFactCard.priority ?? 0) + (factCardData.priority || 1) : existingFactCard.priority
          });
          
          if (factCardData.id) {
            factCardMap.set(factCardData.id, existingFactCard.uid);
          }
        } else {
          const noteUids = this.resolveReferences(factCardData.notes || [], noteMap);
          const deduplicatedNotes = await this.deduplicateEntityNotes(noteUids);
          
          const localFactCard: Omit<FactCardData, 'uid' | 'progress'> = {
            language: factCardData.language,
            front: factCardData.front,
            back: factCardData.back,
            priority: factCardData.priority || 1,
            doNotPractice: false,
            notes: deduplicatedNotes,
            links: [],
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
      for (let i = 0; i < setFiles.resources.length; i++) {
        const resourceData = setFiles.resources[i];
        reportProgress('Processing resources', i, setFiles.resources.length);
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
          const vocabUids = this.resolveReferences(resourceData.vocab || [], vocabMap);
          const factCardUids = this.resolveReferences(resourceData.factCards || [], factCardMap);
          
          const deduplicatedNotes = await this.deduplicateEntityNotes([...existingResource.notes, ...noteUids]);
          
          await this.resourceRepo.updateResource({
            ...existingResource,
            notes: deduplicatedNotes,
            vocab: [...new Set([...existingResource.vocab, ...vocabUids])],
            factCards: [...new Set([...existingResource.factCards, ...factCardUids])],
            origins: [...existingOrigins],
            priority: shouldIncrementPriority ? (existingResource.priority ?? 0) + (resourceData.priority || 1) : existingResource.priority
          });
          
          if (resourceData.id) {
            resourceMap.set(resourceData.id, existingResource.uid);
          }
        } else {
          const noteUids = this.resolveReferences(resourceData.notes || [], noteMap);
          const vocabUids = this.resolveReferences(resourceData.vocab || [], vocabMap);
          const factCardUids = this.resolveReferences(resourceData.factCards || [], factCardMap);
          const link = resourceData.link ? linkMap.get(resourceData.link) : undefined;
          
          const deduplicatedNotes = await this.deduplicateEntityNotes(noteUids);
          
          const localResource: Omit<ResourceData, 'uid' | 'lastShownAt'> = {
            language: resourceData.language,
            isImmersionContent: resourceData.isImmersionContent,
            title: resourceData.title,
            content: resourceData.content,
            priority: resourceData.priority || 1,
            link: link,
            notes: deduplicatedNotes,
            vocab: vocabUids,
            factCards: factCardUids,
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

    // Process goals
    if (setFiles.goals) {
      for (let i = 0; i < setFiles.goals.length; i++) {
        const goalData = setFiles.goals[i];
        reportProgress('Processing goals', i, setFiles.goals.length);
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
          
          const deduplicatedNotes = await this.deduplicateEntityNotes([...existingGoal.notes, ...noteUids]);
          
          await this.goalRepo.update(existingGoal.uid, {
            notes: deduplicatedNotes,
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
          
          const deduplicatedNotes = await this.deduplicateEntityNotes(noteUids);
          
          const localGoal: Omit<GoalData, 'uid'> = {
            language: goalData.language,
            title: goalData.title,
            notes: deduplicatedNotes,
            vocab: vocabUids,
            factCards: factCardUids,
            subGoals: subGoalUids,
            origins: [localSet.uid],
            finishedAddingSubGoals: false,
            finishedAddingMilestones: false,
            finishedAddingKnowledge: false,
            milestones: {},
            isAchieved: false
          };
          
          const savedGoal = await this.goalRepo.create(localGoal);
          newGoalUids.push(savedGoal.uid);
          if (goalData.id) {
            goalMap.set(goalData.id, savedGoal.uid);
          }
        }
      }
    }

    reportProgress('Download complete', 100, 100);

    // Task generation is now handled ad-hoc during lessons
  }

  private async loadAndValidateSetFiles(languageCode: string, setName: string): Promise<RemoteSetFiles | null> {
    const possibleFiles = ['vocab', 'translations', 'notes', 'links', 'resources', 'goals', 'factCards'];
    const setFiles: RemoteSetFiles = {};

    for (const fileName of possibleFiles) {
      try {
        const response = await fetch(`/sets/${languageCode}/${setName}/${fileName}.jsonl`);
        if (!response.ok) {
          if (response.status === 404) {
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Check content type - should be text/plain or application/json for JSONL
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
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

  private isImageDuplicate(imageUrl: string, fileSize: number, mimeType: string, existingImages: VocabImage[]): boolean {
    return existingImages.some(existing => 
      // URL-based comparison (for remote images)
      (imageUrl && existing.url && imageUrl === existing.url) ||
      // Size + mimeType comparison (for all images)
      (existing.fileSize === fileSize && existing.mimeType === mimeType)
    );
  }

  private isSoundDuplicate(fileSize: number, mimeType: string, originalFileName: string | undefined, existingSounds: VocabSound[]): boolean {
    return existingSounds.some(existing => 
      // Size + mimeType + filename comparison (for all sounds)
      (existing.fileSize === fileSize && 
       existing.mimeType === mimeType && 
       existing.originalFileName === originalFileName)
    );
  }

  private deduplicateLinks(links: Link[]): Link[] {
    const seen = new Set<string>();
    return links.filter(link => {
      const key = `${link.label}|${link.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async deduplicateEntityNotes(noteUids: string[]): Promise<string[]> {
    if (noteUids.length <= 1) return noteUids;
    
    // Get all notes
    const notes = await this.noteRepo.getNotesByUIDs(noteUids);
    
    // Group notes by content + noteType signature
    const noteGroups = new Map<string, { note: NoteData; uid: string }[]>();
    
    for (const note of notes) {
      const signature = `${note.content}|${note.noteType || ''}`;
      if (!noteGroups.has(signature)) {
        noteGroups.set(signature, []);
      }
      noteGroups.get(signature)!.push({ note, uid: note.uid });
    }
    
    const keptNoteUids: string[] = [];
    const uidsToDelete: string[] = [];
    
    // For each group, keep the first note and delete the rest
    for (const group of noteGroups.values()) {
      if (group.length > 1) {
        // Keep the first note
        keptNoteUids.push(group[0].uid);
        
        // Mark the duplicate notes for deletion
        const duplicateUids = group.slice(1).map(item => item.uid);
        uidsToDelete.push(...duplicateUids);
      } else {
        // No duplicates, keep the note
        keptNoteUids.push(group[0].uid);
      }
    }
    
    // Delete the duplicate notes
    if (uidsToDelete.length > 0) {
      await this.noteRepo.deleteNotes(uidsToDelete);
    }
    
    return keptNoteUids;
  }

  async isSetDownloaded(setName: string): Promise<boolean> {
    return await this.localSetRepo.isRemoteSetDownloaded(setName);
  }

  async getDownloadedSets(): Promise<LocalSetData[]> {
    return await this.localSetRepo.getAllLocalSets();
  }

  private async processVocabMedia(
    languageCode: string, 
    setName: string, 
    vocabData: z.infer<typeof vocabSchema>[], 
    vocabMap: Map<string, string>
  ): Promise<void> {
    for (const vocab of vocabData) {
      if (!vocab.id) continue;
      
      const localVocabUid = vocabMap.get(vocab.id);
      if (!localVocabUid) continue;

      // Process images
      if (vocab.images && vocab.images.length > 0) {
        for (const imageData of vocab.images) {
          try {
            await this.downloadAndAddImage(languageCode, setName, localVocabUid, imageData);
          } catch (error) {
            console.warn(`Failed to download image ${imageData.filename} for vocab ${vocab.id}:`, error);
          }
        }
      }

      // Process sounds
      if (vocab.sounds && vocab.sounds.length > 0) {
        for (const soundData of vocab.sounds) {
          try {
            await this.downloadAndAddSound(languageCode, setName, localVocabUid, soundData);
          } catch (error) {
            console.warn(`Failed to download sound ${soundData.filename} for vocab ${vocab.id}:`, error);
          }
        }
      }
    }
  }

  private async downloadAndAddImage(
    languageCode: string,
    setName: string, 
    vocabUid: string,
    imageData: { filename: string; alt?: string; tags?: string[] }
  ): Promise<void> {
    const imageUrl = `/sets/${languageCode}/${setName}/images/${imageData.filename}`;
    
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`Image not found: ${imageData.filename} (HTTP ${response.status})`);
        return; // Skip this image and continue
      }

      // Check if this image already exists in the vocab
      const existingVocab = await this.vocabRepo.getVocabByUID(vocabUid);
      if (existingVocab && existingVocab.images) {
        const blob = await response.blob();
        if (this.isImageDuplicate(imageUrl, blob.size, blob.type, existingVocab.images)) {
          console.warn(`Image already exists, skipping: ${imageData.filename}`);
          return; // Skip duplicate image
        }
      }

      // Use addImageFromUrl instead of addImageFromFile to avoid compression issues
      await this.vocabRepo.addImageFromUrl(vocabUid, imageUrl, imageData.alt);
    } catch (error) {
      console.warn(`Failed to download image ${imageData.filename}:`, error);
      // Don't rethrow - continue processing other images
    }
  }

  private async downloadAndAddSound(
    languageCode: string,
    setName: string,
    vocabUid: string, 
    soundData: { filename: string }
  ): Promise<void> {
    try {
      const response = await fetch(`/sets/${languageCode}/${setName}/audio/${soundData.filename}`);
      if (!response.ok) {
        console.warn(`Sound not found: ${soundData.filename} (HTTP ${response.status})`);
        return; // Skip this sound and continue
      }

      const blob = await response.blob();

      // Check if this sound already exists in the vocab
      const existingVocab = await this.vocabRepo.getVocabByUID(vocabUid);
      if (existingVocab && existingVocab.sounds) {
        if (this.isSoundDuplicate(blob.size, blob.type, soundData.filename, existingVocab.sounds)) {
          console.warn(`Sound already exists, skipping: ${soundData.filename}`);
          return; // Skip duplicate sound
        }
      }

      const file = new File([blob], soundData.filename, { type: blob.type });
      
      await this.vocabRepo.addSoundFromFile(vocabUid, file);
    } catch (error) {
      console.warn(`Failed to download sound ${soundData.filename}:`, error);
      // Don't rethrow - continue processing other sounds
    }
  }
}