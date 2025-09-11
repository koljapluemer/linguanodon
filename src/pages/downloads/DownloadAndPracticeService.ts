import type { Router } from 'vue-router';
import { UnifiedRemoteSetService } from './UnifiedRemoteSetService';
import { remoteSetMetaDataSchema } from '@/entities/remote-sets/remoteSetMetaData';
import { z } from 'zod';

export interface DownloadAndPracticeOptions {
  language: string;
  setName: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: string) => void;
}

export class DownloadAndPracticeService {
  constructor(
    private remoteSetService: UnifiedRemoteSetService,
    private router: Router
  ) {}

  /**
   * Downloads a set and immediately starts practice in the preferred mode
   */
  async downloadAndStartPractice(options: DownloadAndPracticeOptions): Promise<void> {
    const { language, setName, onDownloadStart, onDownloadComplete, onError } = options;
    
    try {
      onDownloadStart?.();

      // Check if already downloaded
      const isAlreadyDownloaded = await this.remoteSetService.isSetDownloaded(setName);
      
      if (!isAlreadyDownloaded) {
        await this.remoteSetService.downloadSet(language, setName);
      }

      // Load metadata to get preferred practice mode
      const metadata = await this.loadSetMetadata(language, setName);
      
      onDownloadComplete?.();

      // Navigate to preferred practice mode or default
      const practiceMode = metadata?.preferredMode || 'practice-mode-ultrarandom';
      this.router.push({ name: practiceMode });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download and start practice';
      onError?.(errorMessage);
      throw err;
    }
  }

  /**
   * Downloads a set without starting practice
   */
  async downloadOnly(options: Pick<DownloadAndPracticeOptions, 'language' | 'setName' | 'onDownloadStart' | 'onDownloadComplete' | 'onError'>): Promise<void> {
    const { language, setName, onDownloadStart, onDownloadComplete, onError } = options;
    
    try {
      onDownloadStart?.();
      await this.remoteSetService.downloadSet(language, setName);
      onDownloadComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download set';
      onError?.(errorMessage);
      throw err;
    }
  }

  private async loadSetMetadata(language: string, setName: string): Promise<z.infer<typeof remoteSetMetaDataSchema> | null> {
    try {
      const response = await fetch(`/sets/${language}/${setName}/metadata.json`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return remoteSetMetaDataSchema.parse(data);
    } catch (error) {
      console.error('Failed to load set metadata:', error);
      return null;
    }
  }
}