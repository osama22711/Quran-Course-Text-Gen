import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'summary-tab',
        loadChildren: () => import('../summary-tab/summary-tab.module').then(m => m.SummaryTabModule)
      },
      {
        path: 'reminder-tab',
        loadChildren: () => import('../reminder-tab/reminder-tab.module').then(m => m.ReminderTabModule)
      },
      {
        path: 'settings-tab',
        loadChildren: () => import('../settings-tab/settings-tab.module').then(m => m.SettingsTabModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
