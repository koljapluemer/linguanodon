import type { RemoteResource } from "@/entities/local-sets/remote-data/RemoteResourceData";

export interface RemoteResourceSet {
  name: string;
  resources: RemoteResource[];
}