import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsTab } from './settings-tab.page';

import { SettingsTabRoutingModule } from './settings-tab-routing.module';
import { ExcelExporterService } from '../services/excel-exporter.service';
import { HelperService } from '../services/helper.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SettingsTabRoutingModule
  ],
  declarations: [SettingsTab],
  providers: [
    ExcelExporterService,
    HelperService
  ]
})
export class SettingsTabModule { }
