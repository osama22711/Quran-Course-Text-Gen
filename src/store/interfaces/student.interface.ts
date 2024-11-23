import { Memorization } from "./memorization.interface";
import { Participated } from "./participation.interface";

export interface Student {
    name: string,
    attendance: Participated[],
    memorization: Memorization[]
}