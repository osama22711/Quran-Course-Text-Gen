import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SummaryTab } from './summary-tab.page';

import { SummaryTabRoutingModule } from './summary-tab-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SummaryTabRoutingModule
  ],
  declarations: [SummaryTab]
})
export class SummaryTabModule { }
