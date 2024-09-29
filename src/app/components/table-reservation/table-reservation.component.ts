
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import {NgForOf, NgOptimizedImage} from "@angular/common";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import {FormsModule} from "@angular/forms";

interface Table {
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string | null;
  positionX: number;  // Add X coordinate for table position
  positionY: number;  // Add Y coordinate for table position
  selected?: boolean;  // Optional for selection state in the UI
}

@Component({
  selector: 'app-table-reservation',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCheckbox,
    NgForOf,
    CommonModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: './table-reservation.component.html',
  styleUrls: ['./table-reservation.component.css']
})
export class TableReservationComponent {
  backendUrl: string = "http://localhost:3001/tables";  // Backend URL
  tables: Table[] = [];  // Array of tables
  numberOfCustomers: number = 0;
  numberOfTables: number = 0;
  selectedCount: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.http.get<Table[]>(this.backendUrl).subscribe({
      next: (response: Table[]) => {
        // Add positions dynamically, for example, in a grid
        this.tables = response.map((table, index) => ({
          ...table,
          positionX: (index % 5) * 120,  // Horizontal position (adjust spacing)
          positionY: Math.floor(index / 5) * 120  // Vertical position (adjust spacing)
        }));
        console.log('Fetched tables from backend:', this.tables);
      },
      error: (error: any) => {
        console.error("Error fetching tables from backend:", error);
      }
    });

    const count = this.route.snapshot.paramMap.get('count');
    this.numberOfCustomers = count ? Number(count) : 0;
    this.numberOfTables = Math.ceil(this.numberOfCustomers / 4);
  }

  onSelectionChange() {
    this.selectedCount = this.tables.filter(table => table.selected).length;
  }

  navigateToNextPage() {
    this.router.navigate(['/menu']);
  }
}
