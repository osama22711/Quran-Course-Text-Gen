import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { QuranFont } from './interfaces/quran-font.enum';
import { CarouselComponent, OwlOptions, ResponsiveSettings } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.component.html',
  styleUrls: ['./quran.component.scss'],
})
export class QuranComponent implements AfterViewInit {

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
    rewind: false,
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 }
    },
  }

  @ViewChild('swiper') carouselRef!: CarouselComponent;
  @Input("PageFrom") FROM_PAGE_NUMBER: number = 1;
  @Input("PageTo") TO_PAGE_NUMBER: number = 22;
  @Input("Font") QURAN_FONT: QuranFont = QuranFont.QPCHafs;
  public pages = Array.from({ length: 1 }, (_, i) => i + 1);

  constructor() { }

  ngAfterViewInit(): void {
    const pagesLength = this.TO_PAGE_NUMBER - this.FROM_PAGE_NUMBER;
    this.pages = Array.from({ length: pagesLength }, (_, i) => i + 1);
  }
}
