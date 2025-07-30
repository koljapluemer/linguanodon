import type { LocalObject } from "@/shared/LocalObject";

export interface FactCardData extends LocalObject {
    uid: string
    language: string
    front: string
    back: string
    priority: number;
}