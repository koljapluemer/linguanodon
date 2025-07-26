import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface ImmersionContentData extends TaskData, LocalObject{
  uid: string;
  language: string;

  priority: number;
  associatedUnits: string[]; // ids of vocabd
} 