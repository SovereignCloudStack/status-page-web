import { TestBed } from '@angular/core/testing';

import { IconProviderService } from './icon-provider.service';

describe('IconProviderService', () => {
  let service: IconProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
