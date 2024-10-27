import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { QuranFont } from '../interfaces/quran-font.enum';
import { Verse } from '../interfaces/verse.interface';
import { Word } from '../interfaces/word.interface';

@Component({
  selector: 'quran-page',
  templateUrl: './quran-page.component.html',
  styleUrls: ['./quran-page.component.scss'],
})
export class QuranPageComponent implements OnInit {
  @ViewChild('quran') quranElement!: ElementRef<HTMLElement>;
  @ViewChild('quranContainer') quranContainerElement!: ElementRef<HTMLElement>;
  @Input("Page") PAGE_NUMBER: number = 1;
  @Input("Font") QURAN_FONT: QuranFont = QuranFont.QPCHafs;
  public verses: Verse[] = [];
  public ArabicPageNumber = '';

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

    this.ArabicPageNumber = this.helperService.convertNumber(this.PAGE_NUMBER.toString(), 'toArabic');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.fitText();
  }

  private fitText() {
    const quranSeparators = document.querySelectorAll('.verse-separator') as NodeListOf<HTMLDivElement>;

    const deviceHeight = window.innerHeight;

    // Set the container size dynamically based on aspect ratio 2:3
    const containerHeight = Math.min(deviceHeight * 0.9, 1728);
    const containerWidth = containerHeight * 0.45;

    this.renderer.setStyle(this.quranContainerElement.nativeElement, 'height', `${containerHeight}px`);
    this.renderer.setStyle(this.quranContainerElement.nativeElement, 'width', `${containerWidth}px`);

    const fontSize = (containerHeight / 1728) * 43;
    const lineHeight = fontSize * 1.75;

    this.renderer.setStyle(this.quranElement.nativeElement, 'lineHeight', `${lineHeight}px`);
    this.renderer.setStyle(this.quranElement.nativeElement, 'fontSize', `${fontSize}px`);

    const separatorFontSize = fontSize + 10;

    quranSeparators.forEach((separator: HTMLDivElement) => {
      this.renderer.setStyle(separator, 'fontSize', `${separatorFontSize}px`);
    });
  }

  private extractAndAdjustSpecialQuranicChars(quranicUthmaniHafsText: string) {
    const words = quranicUthmaniHafsText.split(/[\s\u00A0]+/);
    const combinedWords = [];

    for (let i = 0; i < words.length; i++) {
      if (words[i] === "۞" && i + 1 < words.length) {
        // Combine "۞" with the next word
        combinedWords.push(`${words[i]} ${words[i + 1]}`);
        i++; // Skip the next word as it's already combined
      } else if (words[i] !== "") {
        combinedWords.push(words[i]); // Add the current word
      }
    }

    return combinedWords;
  }

  private buildQuranicPage() {
    this.verses.forEach((verse: Verse) => {
      const quranicWords = this.extractAndAdjustSpecialQuranicChars(verse.qpc_uthmani_hafs)
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
    for (let lineNumber = 1; lineNumber <= lineNumberLayout; lineNumber++) {
      const lineDiv = this.renderer.createElement('div');
      this.renderer.addClass(lineDiv, 'quran-line');
      this.renderer.addClass(lineDiv, `page-${this.PAGE_NUMBER}_line-${lineNumber}`);
      this.quranElement.nativeElement?.appendChild(lineDiv);
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
