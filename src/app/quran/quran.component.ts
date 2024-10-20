import { Component, Input, OnInit, Renderer2, HostListener } from '@angular/core';
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

  constructor(private helperService: HelperService, private renderer: Renderer2) { }

  async ngOnInit() {
    const JUZ_NUMBER = 1;
    const data = await this.getQuranJuzVerses(JUZ_NUMBER);
    this.verses = data.filter(x => x.page_number === this.PAGE_NUMBER);

    this.createQuranSkeleton();
    this.loadQuranFontDynamically(this.QURAN_FONT);
    this.buildQuranicPage();
    this.adjustHoverOnVerseSeparator();
    this.fitText();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.fitText();
  }

  private fitText() {
    const container = document.querySelector('.quran-container') as HTMLDivElement;
    const quran = document.querySelector('.quran') as HTMLDivElement;
    const quranSeparators = document.querySelectorAll('.verse-separator') as NodeListOf<HTMLDivElement>;

    const deviceHeight = window.innerHeight;

    // Set the container size dynamically based on aspect ratio 2:3
    const containerHeight = Math.min(deviceHeight * 0.9, 1728);
    const containerWidth = containerHeight * 0.45;

    this.renderer.setStyle(container, 'height', `${containerHeight}px`);
    this.renderer.setStyle(container, 'width', `${containerWidth}px`);

    const fontSize = (containerHeight / 1728) * 47;
    const lineHeight = fontSize * 1.65;

    this.renderer.setStyle(quran, 'lineHeight', `${lineHeight}px`);
    this.renderer.setStyle(quran, 'fontSize', `${fontSize}px`);

    const separatorFontSize = fontSize + 10;

    quranSeparators.forEach((separator: HTMLDivElement) => {
      this.renderer.setStyle(separator, 'fontSize', `${separatorFontSize}px`);
    });
  }

  private buildQuranicPage() {
    this.verses.forEach((verse: Verse) => {
      const quranicWords: string[] = verse.qpc_uthmani_hafs.split(/[\s\u00A0]+/);
      let quranicWordIndex = 0;

      verse.words.forEach((word: Word) => {
        const wordLineNumber = word.line_number;
        const wordPageNumber = word.page_number;
        const lineNumberDiv = document.querySelector(`.page-${wordPageNumber}_line-${wordLineNumber}`);

        const quranicWord = quranicWords[quranicWordIndex];
        const isWord = word.char_type_name === 'word';

        if (!isWord) {
          const verseSeparator = this.renderer.createElement('span');
          this.renderer.addClass(verseSeparator, 'verse-separator');
          this.renderer.setProperty(verseSeparator, 'innerHTML', `${quranicWord}`);
          this.renderer.setStyle(verseSeparator, 'fontFamily', this.QURAN_FONT === QuranFont.QPCHafs ? 'QPCHafs' : `p${verse.page_number}`);
          lineNumberDiv?.appendChild(verseSeparator);
        } else {
          const wordSpan = this.renderer.createElement('span');
          this.renderer.addClass(wordSpan, 'verse-word');
          this.renderer.addClass(wordSpan, `verse-${verse.verse_number}`);
          this.renderer.setStyle(wordSpan, 'fontFamily', this.QURAN_FONT === QuranFont.QPCHafs ? 'QPCHafs' : `p${verse.page_number}`);
          this.renderer.setProperty(wordSpan, 'innerHTML', `${quranicWord}`);
          lineNumberDiv?.appendChild(wordSpan);
          quranicWordIndex++;
        }
      });
    });
  }

  private createQuranSkeleton(lineNumberLayout = 15) {
    const quran = document.querySelector('.quran');

    for (let lineNumber = 1; lineNumber <= lineNumberLayout; lineNumber++) {
      const lineDiv = this.renderer.createElement('div');
      this.renderer.addClass(lineDiv, 'quran-line');
      this.renderer.addClass(lineDiv, `page-${this.PAGE_NUMBER}_line-${lineNumber}`);
      quran?.appendChild(lineDiv);
    }
  }

  private adjustHoverOnVerseSeparator() {
    const verseSeparators: NodeListOf<HTMLSpanElement> = document.querySelectorAll('.verse-separator');

    verseSeparators.forEach((verseSeparator: HTMLSpanElement) => {
      verseSeparator.onmouseenter = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseWords = document.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseWords.forEach((wordSpan: HTMLSpanElement) => {
          this.renderer.addClass(wordSpan, 'manual-hover');
        });
      };

      verseSeparator.onmouseleave = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseWords = document.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseWords.forEach((wordSpan: HTMLSpanElement) => {
          this.renderer.removeClass(wordSpan, 'manual-hover');
        });
      };
    });
  }

  private loadQuranFontDynamically(quranFont = QuranFont.QPCHafs, pageNumber: number = 0) {
    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'type', 'text/css');

    const fontPath = quranFont === QuranFont.QPCHafs
      ? `assets/fonts/${quranFont}/UthmanicHafs1Ver18.woff2`
      : `assets/fonts/${quranFont}/woff2/p${pageNumber}.woff2`;

    this.renderer.setProperty(style, 'innerHTML', `
      @font-face {
        font-family: '${quranFont === QuranFont.QPCHafs ? 'QPCHafs' : `p${pageNumber}`}';
        src: url('${fontPath}') format('woff2');
        font-display: swap;
      }
    `);

    document.head.appendChild(style);
  }

  private async getQuranJuzVerses(juzNumber: number): Promise<Verse[]> {
    try {
      const response = await fetch(`assets/quran_by_chapter/${juzNumber}.json`);

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
