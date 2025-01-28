import { TestBed } from '@angular/core/testing';

import { CustomInterceptorsService } from './custom-interceptors.service';

describe('CustomInterceptorsService', () => {
  let service: CustomInterceptorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomInterceptorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
