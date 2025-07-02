export interface Exercise {
    uid: string
    instructions: string
    content: string
    blockedBy?: string[] // hashes of other exercises
}