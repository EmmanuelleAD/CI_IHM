import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-payment',
  templateUrl: './payment-review.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./payment-review.component.scss']
})
export class PaymentReviewComponent {
  selectedMode: string | null = 'all';
  selectedPerson: any = null;
  tableNumber: number=0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.selectedMode = this.route.snapshot.paramMap.get('selectedMode');
    this.tableNumber = +this.route.snapshot.paramMap.get('tableNumber')!;
    console.log('Selected Mode:', this.selectedMode);
  }
  persons = [
    { name: 'Person 1' },
    { name: 'Person 2' },
  ];
  totalAmount: number = 100;
  orderItems = [
    { name: 'Drink 1', quantity: 2 },
    { name: 'Starter 1', quantity: 1 },
    { name: 'Main Course 1', quantity: 4 },
  ];

  pay() {

    if (this.selectedMode === 'person' && this.selectedPerson) {
      console.log(`Paying for ${this.selectedPerson.name}`);
    } else {
      console.log('Paying for the entire table');
    }
  }

  review() {

    console.log('Review the order');
  }
}
