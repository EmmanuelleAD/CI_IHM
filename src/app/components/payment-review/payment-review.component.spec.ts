import { ComponentFixture, TestBed } from '@angular/core/testing';
import {PaymentReviewComponent} from "./payment-review.component";



describe('PaymentReviewComponent', () => {
  let component: PaymentReviewComponent;
  let fixture: ComponentFixture<PaymentReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
