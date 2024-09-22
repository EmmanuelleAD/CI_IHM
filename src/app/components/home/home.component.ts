import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule,MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}

  navigateToNextPage() {
    this.router.navigate(['/customer-count']);
  }
}
