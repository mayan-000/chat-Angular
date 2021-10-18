import { TestBed } from '@angular/core/testing';

import { RecentChatExtractorService } from './recent-chat-extractor.service';

describe('RecentChatExtractorService', () => {
  let service: RecentChatExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentChatExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
