import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QuranFont } from './interfaces/quran-font.enum';
import { CarouselComponent, OwlOptions, ResponsiveSettings } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.component.html',
  styleUrls: ['./quran.component.scss'],
})
export class QuranComponent implements OnInit {

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
    }
  }

  @ViewChild('swiper') carouselRef!: CarouselComponent;
  @Input("Page") PAGE_NUMBER: number = 1;
  @Input("Font") QURAN_FONT: QuranFont = QuranFont.QPCHafs;
  public pages = Array.from({ length: 21 }, (_, i) => i + 1);

  constructor() { }

  ngOnInit(): void {
  }
}
