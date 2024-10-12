import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryTab } from './summary-tab.page';

const routes: Routes = [
  {
    path: '',
    component: SummaryTab,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummaryTabRoutingModule { }
