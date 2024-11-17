import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { QuranFont } from './interfaces/quran-font.enum';
import { CarouselComponent, OwlOptions, ResponsiveSettings } from 'ngx-owl-carousel-o';
import { Student } from 'src/store/app-state.service';
import * as CuzPageMapping from './mappings/cuz-to-pages.mapping.json';
import { Verse } from './interfaces/verse.interface';
import { Platform } from '@ionic/angular';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.component.html',
  styleUrls: ['./quran.component.scss'],
})
export class QuranComponent implements AfterViewInit, OnInit {

  public sliderOptions: OwlOptions = {
    rtl: true,
    items: 1,
    autoHeight: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    loop: false,
    dots: false,
    nav: false,
    animateIn: false,
    animateOut: false,
    lazyLoad: false,
    rewind: false,
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 }
    },
  }

  @ViewChild('swiper') carouselRef!: CarouselComponent;
  @Input("Page") PAGE_NUMBER: number = 3;
  @Input('JUZ') JUZ_NUMBER: number = 1;
  @Input("Student") STUDENT: Student | null = null;
  @Input("Font") QURAN_FONT: QuranFont = QuranFont.QPCHafs;
  public pages: number[] = [];
  public juzVerses: Verse[] = [];
  public isLoaded = false;
  public loadedPages = 0;
  private loader: HTMLIonLoadingElement | null = null;

  constructor(
    private platform: Platform,
    private loaderService: LoaderService
  ) {
  }

  async ngOnInit() {
    await this.platform.ready();
    this.loader = await this.loaderService.presentLoadingSpinner(5000);
    this.loadedPages = 0;
    this.juzVerses = await this.getQuranJuzVerses(this.JUZ_NUMBER);
    this.pages = this.getJuzPages();
  }

  async ngAfterViewInit() {
    this.goToSlide(this.PAGE_NUMBER.toString());
  }

  public getPageVerses(pageNumber: number): Verse[] {
    return this.juzVerses.filter(x => x.page_number === pageNumber);
  }

  quranLoadedEvent(pageNumber: number) {
    if (this.isLoaded) return;

    const requiredPagesToLoad = Math.floor(this.pages.length / 4);
    this.loadedPages++;

    if (this.loadedPages >= requiredPagesToLoad) {
      this.isLoaded = true;
      setTimeout(() => {
        this.loader!.dismiss();
      }, 100);
    } else if (pageNumber === this.PAGE_NUMBER) {
      this.isLoaded = true;
      setTimeout(() => {
        this.loader!.dismiss();
      }, 100);
    }
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

  private goToSlide(index: string): void {
    if (this.carouselRef) {
      this.carouselRef.to(index);
    } else {
      console.error('Carousel component not initialized.');
    }
  }

  private getJuzPages(): number[] {
    const juzPagesArray = (CuzPageMapping as Record<string, number[]>)[this.JUZ_NUMBER.toString()];
    if (!juzPagesArray) {
      throw new Error(`Invalid Juz Number: ${this.JUZ_NUMBER}`);
    }
    return juzPagesArray;
  }
}
