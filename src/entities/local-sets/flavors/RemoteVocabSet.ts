import type { RemoteVocab } from "@/entities/local-sets/remote-data/RemoteVocabData";

export interface RemoteVocabSet {
  name: string;
  vocabs: RemoteVocab[];
}