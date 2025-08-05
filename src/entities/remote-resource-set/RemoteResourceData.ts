export interface RemoteResource {
  language: string;
  priority: number;
  title: string;
  prompt: string;
}

export interface RemoteResourceSet {
  name: string;
  resources: RemoteResource[];
}