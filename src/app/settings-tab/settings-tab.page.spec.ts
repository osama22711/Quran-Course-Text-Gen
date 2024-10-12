import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SettingsTab as SettingsTab } from './settings-tab.page';

describe('SettingsTab', () => {
  let component: SettingsTab;
  let fixture: ComponentFixture<SettingsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsTab],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
