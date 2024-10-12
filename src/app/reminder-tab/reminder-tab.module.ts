import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderTab } from './reminder-tab.page';

import { ReminderTabRoutingModule } from './reminder-tab-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReminderTabRoutingModule
  ],
  declarations: [ReminderTab]
})
export class ReminderTabModule { }
