import { Component, Input, OnInit } from '@angular/core';
import { HelperService } from '../services/helper.service';
import { QuranFont } from './interfaces/quran-font.enum';
import { Word } from './interfaces/word.interface';
import { Verse } from './interfaces/verse.interface';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.component.html',
  styleUrls: ['./quran.component.scss'],
})
export class QuranComponent implements OnInit {
  @Input() PAGE_NUMBER: number = 3;
  @Input() QURAN_FONT: QuranFont = QuranFont.QPCHafs;
  public verses: Verse[] = [];

  constructor(private helperService: HelperService) { }

  async ngOnInit() {
    const JUZ_NUMBER = 1;
    const data = await this.getQuranJuzVerses(JUZ_NUMBER);
    this.verses = data.filter(x => x.page_number === this.PAGE_NUMBER);

    this.createQuranSkeleton();
    this.loadQuranFontDynamically(this.QURAN_FONT);
    this.buildQuranicPage();
    this.adjustHoverOnVerseSeparator();
    this.fitText();

    window.onload = this.fitText;
    window.onresize = this.fitText;
  }

  private fitText() {
    const container = document.querySelector(
      '.quran-container',
    ) as HTMLDivElement;
    const quran = document.querySelector('.quran') as HTMLDivElement;
    const quranSeparators = document.querySelectorAll(
      '.verse-separator',
    ) as NodeListOf<HTMLDivElement>;

    const deviceHeight = window.innerHeight;
    const deviceWidth = window.innerWidth;

    // Set the container size dynamically based on aspect ratio 2:3
    const containerHeight = Math.min(deviceHeight * 0.9, 1728);
    const containerWidth = containerHeight * 0.45;

    container.style.height = `${containerHeight}px`;
    container.style.width = `${containerWidth}px`;

    let fontSize = (containerHeight / 1728) * 47;

    const lineHeight = fontSize * 1.65;
    quran.style.lineHeight = lineHeight + 'px';

    quran.style.fontSize = fontSize + 'px';

    let separatorFontSize = fontSize + 10;

    for (let i = 0; i < quranSeparators.length; i++) {
      const quranSeparator = quranSeparators[i];
      quranSeparator.style.fontSize = separatorFontSize + 'px';
    }
  }

  private buildQuranicPage() {
    this.verses.forEach((verse: any) => {
      const quranicWords: string[] = verse[`${this.QURAN_FONT}`].split(/[\s\u00A0]+/);
      let quranicWordIndex = 0;

      verse.words.forEach((word: Word, index: number) => {
        const wordLineNumber = word.line_number;
        const wordPageNumber = word.page_number;
        const lineNumberDiv = document.querySelector(
          `.page-${wordPageNumber}_line-${wordLineNumber}`,
        );
        const quranicWord = quranicWords[quranicWordIndex];
        const isWord = word.char_type_name === 'word';

        if (!isWord) {
          const verseSeparator = document.createElement('span');
          verseSeparator.classList.add('verse-separator');
          verseSeparator.innerHTML = `${quranicWord}`;
          verseSeparator.style.fontFamily = `${this.QURAN_FONT === QuranFont.QPCHafs} ? 'QPCHafs' : p${verse.page_number}`;
          lineNumberDiv?.append(verseSeparator);
        } else {
          const wordSpan = document.createElement('span');
          wordSpan.classList.add('verse-word');
          wordSpan.classList.add(`verse-${verse.verse_number}`);
          wordSpan.style.fontFamily = `${this.QURAN_FONT === QuranFont.QPCHafs} ? 'QPCHafs' : p${verse.page_number}`;
          wordSpan.innerHTML = `${quranicWord}`;

          lineNumberDiv?.append(wordSpan);
          quranicWordIndex++;
        }
      });
    });
  }

  private createQuranSkeleton(lineNumberLayout = 15) {
    const quran = document.querySelector('.quran');

    for (let lineNumber = 1; lineNumber <= lineNumberLayout; lineNumber++) {
      const lineDiv = document.createElement('div');
      lineDiv.classList.add('quran-line', `page-${this.PAGE_NUMBER}_line-${lineNumber}`);
      quran?.append(lineDiv);
    }
  }

  private adjustHoverOnVerseSeparator() {
    const verseSeparators: NodeListOf<HTMLSpanElement> =
      document.querySelectorAll('.verse-separator');

    verseSeparators.forEach((verseSeparator: HTMLSpanElement) => {
      verseSeparator!.onmouseenter = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseWords = document.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseWords.forEach((wordSpan: HTMLSpanElement) => {
          wordSpan.classList.add('manual-hover');
        });
      };

      verseSeparator!.onmouseleave = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseWords = document.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseWords.forEach((wordSpan: HTMLSpanElement) => {
          wordSpan.classList.remove('manual-hover');
        });
      };
    });
  }

  private loadQuranFontDynamically(quranFont = QuranFont.QPCHafs, pageNumber: number = 0) {
    const style = document.createElement('style');
    style.type = 'text/css';

    if (quranFont === QuranFont.QPCHafs) {
      style.innerHTML = `
      @font-face {
        font-family: 'QPCHafs';
        src: url('assets/fonts/${quranFont}/UthmanicHafs1Ver18.woff2') format('woff2'),
        url('assets/fonts/${quranFont}/UthmanicHafs1Ver18.ttf') format('ttf');
        font-display: swap;
      }`;
    } else {
      style.innerHTML = `
        @font-face {
          font-family: 'p${pageNumber}';
          src: url('assets/fonts/${quranFont}/woff2/p${pageNumber}.woff2') format('woff2'),
                url('assets/fonts/${quranFont}/woff/p${pageNumber}.woff') format('woff');
          font-display: swap;
      }`;
    }
    document.head.appendChild(style);
  }

  private async getQuranJuzVerses(cuzNumber: number): Promise<Verse[]> {
    try {
      const response = await fetch(`assets/quran_by_chapter/${cuzNumber}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      const data: Verse[] = await response.json();

      return data;
    } catch (error) {
      console.error(error);
      throw new Error('Error loading or parsing the JSON file.');
    }
  }
}
