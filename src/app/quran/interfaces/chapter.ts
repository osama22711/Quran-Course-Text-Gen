interface Chapter {
  id?: number | string;
  localizedId?: string;
  versesCount: number;
  bismillahPre: boolean;
  revelationOrder: number;
  revelationPlace: string;
  pages: Array<number>;
  nameComplex: string;
  transliteratedName: string;
  nameArabic: string;
  translatedName: string;
}

export default Chapter;
