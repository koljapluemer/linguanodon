import type { Card } from "ts-fsrs"

export interface FactFlashcard {
    uid: string
    language: string
    isUserCreated: boolean // did the user make this, or did they download it
    lastDownloadedAt: Date | null

    front: string
    back: string

    card: Card
}