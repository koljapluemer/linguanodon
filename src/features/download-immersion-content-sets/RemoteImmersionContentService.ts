import type { RemoteImmersionContentSet } from '@/entities/local-sets/flavors/RemoteImmersionContentSet';

export class RemoteImmersionContentService {
  async getAvailableImmersionContentSets(languageCode: string): Promise<string[]> {
    try {
      const response = await fetch(`/immersion_content_sets/${languageCode}/index.json`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch immersion content sets for ${languageCode}:`, error);
      return [];
    }
  }

  async getImmersionContentSet(languageCode: string, name: string): Promise<RemoteImmersionContentSet | null> {
    try {
      const response = await fetch(`/immersion_content_sets/${languageCode}/${name}.json`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        name,
        immersionContent: data.immersionContent || []
      };
    } catch (error) {
      console.error(`Failed to fetch immersion content set ${name} for ${languageCode}:`, error);
      return null;
    }
  }

  getDownloadedImmersionContentSets(): string[] {
    const downloaded = localStorage.getItem('downloadedImmersionContentSets');
    return downloaded ? JSON.parse(downloaded) : [];
  }

  markImmersionContentSetAsDownloaded(name: string): void {
    const downloaded = this.getDownloadedImmersionContentSets();
    if (!downloaded.includes(name)) {
      downloaded.push(name);
      localStorage.setItem('downloadedImmersionContentSets', JSON.stringify(downloaded));
    }
  }

  isImmersionContentSetDownloaded(name: string): boolean {
    return this.getDownloadedImmersionContentSets().includes(name);
  }
}