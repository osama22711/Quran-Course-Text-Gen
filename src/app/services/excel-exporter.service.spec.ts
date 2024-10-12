import { TestBed } from '@angular/core/testing';

import { ExcelExporterService } from './excel-exporter.service';

describe('ExcelExporterService', () => {
  let service: ExcelExporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelExporterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
