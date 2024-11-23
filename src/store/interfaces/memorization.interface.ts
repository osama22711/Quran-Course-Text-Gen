export interface Memorization {
    date: string,
    hasParticipated: boolean,
    pages?: number[],
    mistakes?: MemorizationMistake[]
}

export interface MemorizationMistake {
    quranicWord: string,
    note?: string
}