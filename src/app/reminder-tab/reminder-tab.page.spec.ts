import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReminderTab } from './reminder-tab.page';

describe('ReminderTab', () => {
  let component: ReminderTab;
  let fixture: ComponentFixture<ReminderTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReminderTab],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
