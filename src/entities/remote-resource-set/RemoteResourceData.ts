import type { LocalObject } from "@/shared/LocalObject";

export interface RemoteResource {
  language: string;
  priority: number;
}

export interface RemoteResourceSet extends LocalObject {
  name: string;
  resources: RemoteResource[];
}