import type { RemoteImmersionContent } from "@/entities/local-sets/remote-data/RemoteImmersionContent";

export interface RemoteImmersionContentSet {
  name: string;
  immersionContent: RemoteImmersionContent[];
}