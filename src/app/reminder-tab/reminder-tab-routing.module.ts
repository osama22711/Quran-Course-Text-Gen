import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReminderTab } from './reminder-tab.page';

const routes: Routes = [
  {
    path: '',
    component: ReminderTab,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReminderTabRoutingModule { }
