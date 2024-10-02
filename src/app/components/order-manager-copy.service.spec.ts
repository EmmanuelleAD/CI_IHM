import { TestBed } from '@angular/core/testing';

import { OrderManagerCopyService } from './order-manager-copy.service';

describe('OrderManagerCopyService', () => {
  let service: OrderManagerCopyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderManagerCopyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
