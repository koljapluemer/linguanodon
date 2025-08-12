import type { Link } from "@/shared/Link";

export interface RemoteResource {
  language: string;
  priority: number;
  title: string;

  content?: string;
  link?: Link
}

export interface RemoteResourceSet {
  name: string;
  resources: RemoteResource[];
}