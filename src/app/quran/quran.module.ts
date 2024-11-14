import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuranComponent } from './quran.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { QuranPageComponent } from './quran-page/quran-page.component';
import { NotePopoverComponent } from './note-popover/note-popover.component';

const routes: Routes = [
  { path: '', component: QuranComponent }
];

@NgModule({
  declarations: [QuranComponent, QuranPageComponent, NotePopoverComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonicModule,
    CarouselModule,
    RouterModule.forChild(routes)
  ],
  exports: [QuranComponent]
})
export class QuranModule { }
