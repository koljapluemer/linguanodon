import type { RemoteResourceSet } from '@/entities/local-sets/flavors/RemoteResourceSet';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';

export class RemoteSetService {
  constructor(private localSetRepo: LocalSetRepoContract) {}

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

  async getDownloadedResourceSets(): Promise<LocalSetData[]> {
    return await this.localSetRepo.getAllLocalSets();
  }

  async markResourceSetAsDownloaded(name: string, language: string, description?: string): Promise<LocalSetData> {
    // Check if set already exists
    const existingLocalSet = await this.localSetRepo.getLocalSetByName(name);
    
    if (existingLocalSet) {
      // Update existing local set with new download time
      const updatedLocalSet: LocalSetData = {
        ...existingLocalSet,
        lastDownloadedAt: new Date()
      };
      await this.localSetRepo.updateLocalSet(updatedLocalSet);
      return updatedLocalSet;
    } else {
      // Create new local set record
      const localSetData: Omit<LocalSetData, 'uid'> = {
        name,
        language,
        description,
        lastDownloadedAt: new Date()
      };
      return await this.localSetRepo.saveLocalSet(localSetData);
    }
  }

  async isResourceSetDownloaded(name: string): Promise<boolean> {
    return await this.localSetRepo.isRemoteSetDownloaded(name);
  }
}