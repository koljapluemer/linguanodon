import type { RemoteResourceSet } from './RemoteResourceData';

export class RemoteResourceService {
  async getAvailableResourceSets(languageCode: string): Promise<string[]> {
    try {
      const response = await fetch(`/resource_sets/${languageCode}/index.json`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch resource sets for ${languageCode}:`, error);
      return [];
    }
  }

  async getResourceSet(languageCode: string, name: string): Promise<RemoteResourceSet | null> {
    try {
      const response = await fetch(`/resource_sets/${languageCode}/${name}.json`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        name,
        resources: data.resources || []
      };
    } catch (error) {
      console.error(`Failed to fetch resource set ${name} for ${languageCode}:`, error);
      return null;
    }
  }

  getDownloadedResourceSets(): string[] {
    const downloaded = localStorage.getItem('downloadedResourceSets');
    return downloaded ? JSON.parse(downloaded) : [];
  }

  markResourceSetAsDownloaded(name: string): void {
    const downloaded = this.getDownloadedResourceSets();
    if (!downloaded.includes(name)) {
      downloaded.push(name);
      localStorage.setItem('downloadedResourceSets', JSON.stringify(downloaded));
    }
  }

  isResourceSetDownloaded(name: string): boolean {
    return this.getDownloadedResourceSets().includes(name);
  }
}