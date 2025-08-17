import type { RemoteVocabSet } from '@/entities/local-sets/flavors/RemoteVocabSet';

export class RemoteVocabService {
  async getAvailableVocabSets(languageCode: string): Promise<string[]> {
    try {
      const response = await fetch(`/vocab_sets/${languageCode}/index.json`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch vocab sets for ${languageCode}:`, error);
      return [];
    }
  }

  async getVocabSet(languageCode: string, name: string): Promise<RemoteVocabSet | null> {
    try {
      const response = await fetch(`/vocab_sets/${languageCode}/${name}.json`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        name,
        vocabs: data.vocabs || []
      };
    } catch (error) {
      console.error(`Failed to fetch vocab set ${name} for ${languageCode}:`, error);
      return null;
    }
  }

  getDownloadedVocabSets(): string[] {
    const downloaded = localStorage.getItem('downloadedVocabSets');
    return downloaded ? JSON.parse(downloaded) : [];
  }

  markVocabSetAsDownloaded(name: string): void {
    const downloaded = this.getDownloadedVocabSets();
    if (!downloaded.includes(name)) {
      downloaded.push(name);
      localStorage.setItem('downloadedVocabSets', JSON.stringify(downloaded));
    }
  }

  isVocabSetDownloaded(name: string): boolean {
    return this.getDownloadedVocabSets().includes(name);
  }
}