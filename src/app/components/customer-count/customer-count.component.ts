import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-customer-count',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './customer-count.component.html',
  styleUrl: './customer-count.component.scss'
})

export class CustomerCountComponent {
  count: string = '0';
  constructor(private router: Router) {}
  increment() {
    this.count = (parseInt(this.count) + 1).toString();
  }

  decrement() {
    const currentCount = parseInt(this.count);
    if (currentCount > 0) {
      this.count = (currentCount - 1).toString();
    }
  }

  appendNumber(value: string) {
    if (this.count === '0') {
      this.count = value;  // Replace initial zero
    } else {
      this.count += value;  // Append the number
    }
  }

  clearNumber() {
    this.count = '0';  // Reset to zero
  }

  deleteLast() {
    this.count = this.count.length > 1 ? this.count.slice(0, -1) : '0';  // Delete the last character
  }

  validateButton() {
    this.router.navigate(['/table-reservation', this.count]);
  }
}
