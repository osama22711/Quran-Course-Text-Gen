export enum CharType {
    Word = 'word',
    End = 'end'
}

export interface Word {
    verse_key?: string;
    char_type_name: CharType;
    code_v1?: string;
    code_v2?: string;
    page_number?: number;
    hizb_number?: number;
    line_number?: number;
    position: number;
    location?: string;
    id?: number;
    text_uthmani?: string;
    text_indopak?: string;
    qpc_uthmani_hafs?: string;
    highlight?: string | boolean;
    text?: string;
}