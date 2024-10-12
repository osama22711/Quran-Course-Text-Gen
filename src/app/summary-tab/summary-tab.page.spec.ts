import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SummaryTab } from './summary-tab.page';

describe('SummaryTab', () => {
  let component: SummaryTab;
  let fixture: ComponentFixture<SummaryTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SummaryTab],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
