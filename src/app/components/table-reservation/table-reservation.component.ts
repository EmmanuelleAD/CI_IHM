import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { NgForOf } from "@angular/common";
import { CommonModule } from '@angular/common';

import { Table } from '../../model/model';  // Ensure this model is updated according to your backend response

import { FormsModule } from '@angular/forms';
import { TableComponent } from "../shared/table/table.component";
import { ActivatedRoute, Router } from "@angular/router";

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
    TableComponent,
    NgForOf,
    CommonModule,
    FormsModule
  ],
  templateUrl: './table-reservation.component.html',
  styleUrls: ['./table-reservation.component.css']
})
export class TableReservationComponent {
  backendUrl: string = "http://localhost:3001/tables";  // Updated backend URL

  tables: Table[] = [];  // Initialize with empty array

  numberOfCustomers: number = 0;
  numberOfTables: number = 0;
  selectedCount: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Fetch tables directly from the backend using the correct URL
    this.http.get<Table[]>(this.backendUrl).subscribe({
      next: (response: Table[]) => {
        this.tables = response;  // Assign the response to the tables array
        console.log('Fetched tables from backend:', response);
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
