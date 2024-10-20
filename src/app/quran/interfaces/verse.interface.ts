import { Word } from "./word.interface";

export interface Verse {
    id: number;
    verse_number: number;
    chapter_id?: number | string;
    page_number: number;
    juz_number: number;
    hizb_number: number;
    verse_key: string;
    verse_index: number;
    words: Word[];
    text_uthmani?: string;
    text_uthmani_simple?: string;
    text_uthmani_tajweed?: string;
    text_imlaei?: string;
    text_imlaei_simple?: string;
    text_indopak?: string;
    qpc_uthmani_hafs: string;
    sajdah_number: null;
    sajdah_type: null;
    image_url?: string;
    image_width?: number;
    v1_page?: number;
    v2_page?: number;
    code_v1?: string;
    code_v2?: string;
}