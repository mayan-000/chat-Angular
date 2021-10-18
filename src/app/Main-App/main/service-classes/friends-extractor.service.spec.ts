import { TestBed } from '@angular/core/testing';

import { FriendsExtractorService } from './friends-extractor.service';

describe('FriendsExtractorService', () => {
  let service: FriendsExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
