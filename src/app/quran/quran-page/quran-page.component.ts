import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { QuranFont } from '../interfaces/quran-font.enum';
import { Verse } from '../interfaces/verse.interface';
import { Word } from '../interfaces/word.interface';
import { GestureController, GestureDetail, PopoverController } from '@ionic/angular';
import { NotePopoverComponent } from '../note-popover/note-popover.component';

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
  private longPressTimeout: any;
  private longPressTimeoutTimeInMs = 500;

  constructor(
    private el: ElementRef,
    private helperService: HelperService,
    private renderer: Renderer2,
    private gestureCtrl: GestureController,
    private popoverController: PopoverController
  ) { }

  async ngOnInit() {
    const JUZ_NUMBER = 1;
    const data = await this.getQuranJuzVerses(JUZ_NUMBER);
    this.verses = data.filter(x => x.page_number === this.PAGE_NUMBER);

    this.createQuranSkeleton();
    this.loadQuranFontDynamically(this.QURAN_FONT);
    this.buildSurahNameAndBasmallah();
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
    const quranSeparators = this.el.nativeElement.querySelectorAll('.verse-separator') as NodeListOf<HTMLDivElement>;

    const deviceHeight = window.innerHeight;

    // Set the container size dynamically based on aspect ratio 2:3
    const containerHeight = Math.min(deviceHeight * 0.9, 1728);
    const containerWidth = containerHeight * 0.45;

    this.renderer.setStyle(this.quranContainerElement.nativeElement, 'height', `${containerHeight}px`);
    this.renderer.setStyle(this.quranContainerElement.nativeElement, 'width', `${containerWidth}px`);

    const fontSize = (containerHeight / 1728) * 45;
    const lineHeight = fontSize * 1.75;

    this.renderer.setStyle(this.quranElement.nativeElement, 'lineHeight', `${lineHeight}px`);
    this.renderer.setStyle(this.quranElement.nativeElement, 'fontSize', `${fontSize}px`);

    const separatorFontSize = fontSize + 10;

    quranSeparators.forEach((separator: HTMLDivElement) => {
      this.renderer.setStyle(separator, 'fontSize', `${separatorFontSize}px`);
    });

    const surahNameContainerElements = this.el.nativeElement.querySelectorAll('.surah-name-container') as NodeListOf<HTMLDivElement>;
    surahNameContainerElements.forEach((surahNameContainerElement: HTMLDivElement) => {
      this.renderer.setStyle(surahNameContainerElement, 'fontSize', `${separatorFontSize}px`);
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

  private buildSurahNameAndBasmallah() {
    const filledLineNumbers = this.getFilledLines(this.verses);
    let missingLineNumbers = this.findMissingLineNumber(filledLineNumbers);

    for (let i = 0; i < missingLineNumbers.length; i++) {
      const missingLineNumber = missingLineNumbers[i];

      const lineNumberDiv = this.el.nativeElement.querySelector(`.page-${this.verses[0].page_number}_line-${missingLineNumber}`);
      const surahNameElement = this.buildSurahNameHTMLElement();
      lineNumberDiv?.appendChild(surahNameElement);

      missingLineNumbers = missingLineNumbers.slice(1);

      const hasBismillah = missingLineNumbers.includes(missingLineNumber + 1);
      if (hasBismillah) {
        const nextLineNumberDiv = this.el.nativeElement.querySelector(`.page-${this.verses[0].page_number}_line-${missingLineNumber + 1}`);
        const bismillahElement = this.buildBismillahHTMLElement();
        nextLineNumberDiv?.appendChild(bismillahElement);

        missingLineNumbers = missingLineNumbers.slice(1);
        i--;
      }
    }
  }

  private buildSurahNameHTMLElement(): HTMLElement {
    const surahNameContainerElement = this.renderer.createElement('div');
    surahNameContainerElement.classList.add('surah-name-container');
    const surahNameImageElement = this.renderer.createElement('img');
    surahNameImageElement.src = 'assets/surah_border.png';
    surahNameImageElement.classList.add('surah-name');
    surahNameContainerElement.appendChild(surahNameImageElement);
    const style = this.renderer.createElement('style');
    const surahNumber = this.verses[0].chapter_id?.toString().padStart(3, '0');
    surahNameContainerElement.classList.add(`surah-name-container-${surahNumber}`);
    style.innerHTML = `
        .surah-name-container-${surahNumber}::after {
          content: "${surahNumber}surah";
        }
      `;
    this.renderer.appendChild(this.el.nativeElement, style);

    return surahNameContainerElement;
  }

  private buildBismillahHTMLElement(): HTMLElement {
    const bismillahContainerElement = this.renderer.createElement('div');
    bismillahContainerElement.classList.add('bismillah-container');
    const bismillahImageElement = this.renderer.createElement('img');
    bismillahImageElement.src = 'assets/bismillah.svg';
    bismillahImageElement.classList.add('bismillah');
    bismillahContainerElement.appendChild(bismillahImageElement);

    return bismillahContainerElement;
  }

  private getFilledLines(verses: Verse[]): number[] {
    const lines = new Set<number>();

    verses.forEach(verse => {
      verse.words.forEach(word => {
        lines.add(word.line_number);
      });
    });

    return Array.from(lines).sort((a, b) => a - b);
  }

  private findMissingLineNumber(filledLines: number[]): number[] {
    const missingNumbers: number[] = [];
    const maxNum = Math.max(...filledLines);

    // Create a set for quick lookup
    const numSet = new Set(filledLines);

    // Start checking from 1 up to the maximum number
    for (let i = 1; i <= maxNum; i++) {
      if (!numSet.has(i)) {
        missingNumbers.push(i);
      }
    }

    return missingNumbers;
  }

  private buildQuranicPage() {
    this.verses.forEach((verse: Verse) => {
      const quranicWords = this.extractAndAdjustSpecialQuranicChars(verse.qpc_uthmani_hafs);
      const verseNumber = verse.verse_number;
      const wordPageNumber = verse.page_number;
      let quranicWordIndex = 0;

      verse.words.forEach((word: Word) => {
        const wordLineNumber = word.line_number;

        const verseLineDiv = this.el.nativeElement.querySelector(`.page-${wordPageNumber}_line-${wordLineNumber}`);
        let verseDiv = this.el.nativeElement.querySelector(`.page-${wordPageNumber}_line-${wordLineNumber}_verse-${verseNumber}`);
        if (verseDiv === null) {
          verseDiv = this.renderer.createElement('div');
          this.renderer.addClass(verseDiv, `page-${wordPageNumber}_line-${wordLineNumber}_verse-${verseNumber}`);
          this.renderer.addClass(verseDiv, `verse-${verseNumber}`)
          this.renderer.addClass(verseDiv, 'verse-line-container');
        }

        const quranicWord = quranicWords[quranicWordIndex];
        const isWord = word.char_type_name === 'word';

        if (!isWord) {
          const verseSeparator = this.renderer.createElement('span');
          this.renderer.addClass(verseSeparator, 'verse-separator');
          this.renderer.setProperty(verseSeparator, 'innerHTML', `${quranicWord}`);
          this.renderer.setStyle(verseSeparator, 'fontFamily', this.QURAN_FONT === QuranFont.QPCHafs ? 'QPCHafs' : `p${verse.page_number}`);
          this.createLongPressGesture(verseSeparator);
          verseDiv?.appendChild(verseSeparator);
          verseLineDiv?.appendChild(verseDiv);
        } else {
          const wordSpan = this.renderer.createElement('span');
          this.renderer.addClass(wordSpan, 'verse-word');
          this.renderer.addClass(wordSpan, `verse-${verse.verse_number}_word-${word.id}`);
          this.renderer.setStyle(wordSpan, 'fontFamily', this.QURAN_FONT === QuranFont.QPCHafs ? 'QPCHafs' : `p${verse.page_number}`);
          this.renderer.setProperty(wordSpan, 'innerHTML', `${quranicWord}`);
          this.createLongPressGesture(wordSpan);
          verseDiv?.appendChild(wordSpan);
          verseLineDiv?.appendChild(verseDiv);
          quranicWordIndex++;
        }
      });
    });
  }

  private createLongPressGesture(htmlElement: Node) {
    const gesture = this.gestureCtrl.create({
      el: htmlElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: (ev: GestureDetail) => {
        this.longPressTimeout = setTimeout(() => {
          this.handleLongPress(ev);
        }, this.longPressTimeoutTimeInMs);
      },
      onMove: (ev: GestureDetail) => {
      },
      onEnd: (ev: GestureDetail) => {
        clearTimeout(this.longPressTimeout);
      }
    });
    gesture.enable(true);
  }

  private async handleLongPress(event: GestureDetail) {
    const popover = await this.popoverController.create({
      component: NotePopoverComponent,
      event: event.event,
      side: 'top',
      alignment: 'center',
      arrow: true,
      cssClass: 'quran-note-popover',
      showBackdrop: false,
    });

    await popover.present();
  }

  private createQuranSkeleton(lineNumberLayout = 15) {
    if (this.quranElement.nativeElement.children.length > 0) return;

    for (let lineNumber = 1; lineNumber <= lineNumberLayout; lineNumber++) {
      const lineDiv = this.renderer.createElement('div');
      this.renderer.addClass(lineDiv, 'quran-line');
      this.renderer.addClass(lineDiv, `page-${this.PAGE_NUMBER}_line-${lineNumber}`);
      this.quranElement.nativeElement.classList.add(`page-${this.PAGE_NUMBER}`)
      this.quranElement.nativeElement?.appendChild(lineDiv);
    }
  }

  private adjustHoverOnVerseSeparator() {
    const verseSeparators: NodeListOf<HTMLSpanElement> = this.el.nativeElement.querySelectorAll('.verse-separator');

    verseSeparators.forEach((verseSeparator: HTMLSpanElement) => {
      verseSeparator.onmouseenter = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseDiv = this.el.nativeElement.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseDiv.forEach((wordSpan: HTMLSpanElement) => {
          this.renderer.addClass(wordSpan, 'manual-hover');
        });
      };

      verseSeparator.onmouseleave = () => {
        const verseNumber = this.helperService.convertNumber(verseSeparator.innerHTML, 'toEnglish');
        const verseDiv = this.el.nativeElement.querySelectorAll(`.verse-${verseNumber}`) as NodeListOf<HTMLSpanElement>;

        verseDiv.forEach((wordSpan: HTMLSpanElement) => {
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

    this.el.nativeElement.appendChild(style);
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
