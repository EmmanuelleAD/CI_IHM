import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  standalone: true,
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  tableNumber: number = 1;


  constructor(private router: Router) {}




  payAll() {
    this.router.navigate(['/payment-review',"all",this.tableNumber]);

  }


  paySeparately() {
    this.router.navigate(['/payment-review',"person",this.tableNumber]);
  }
}
