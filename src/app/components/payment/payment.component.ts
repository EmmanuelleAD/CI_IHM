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

    console.log('Pay all the table');
  }


  paySeparately() {
    console.log('Pay separately');
  }
}
