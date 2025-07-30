import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface ResourceData extends TaskData, LocalObject {
  uid: string;
  language: string;

  priority: number;
  extractedUnits: string[]; // ids of vocabd
}
