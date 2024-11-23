import { NoonAhkam, MeemAhkam, MdoodAhkam, LamAhkam, RaAhkam } from './../../app/quran/interfaces/akham.interface';
import { TashkeelMistake } from "src/app/quran/interfaces/akham.interface"

export interface Memorization {
    date: string,
    hasParticipated: boolean,
    pages?: MemorizationPage[],
}

export interface MemorizationPage {
    pageNumber: number,
    mistakes?: MemorizationMistake[]
}

export interface MemorizationMistake {
    id: string,
    note?: string,
    tashkeelMistake?: TashkeelMistake,
    noonAhkam?: NoonAhkam,
    meemAhkam?: MeemAhkam,
    mdoodAhkam?: MdoodAhkam,
    lamAhkam?: LamAhkam
    raAhkam?: RaAhkam
}