import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QuranFont } from './interfaces/quran-font.enum';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.component.html',
  styleUrls: ['./quran.component.scss'],
})
export class QuranComponent implements OnInit {

  public sliderOptions: OwlOptions = {
    rtl: true,
    items: 1,
    autoHeight: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    loop: false,
    dots: false,
    nav: false,
    animateIn: false,
    animateOut: false,
    rewind: false,
  }

  @ViewChild('swiper') carouselRef!: CarouselComponent;
  @Input("Page") PAGE_NUMBER: number = 3;
  @Input("Font") QURAN_FONT: QuranFont = QuranFont.QPCHafs;

  constructor() { }

  ngOnInit(): void {
  }
}
