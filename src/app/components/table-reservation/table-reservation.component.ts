import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { NgForOf } from "@angular/common";
import { CommonModule } from '@angular/common';

import { Table } from '../../model/model';

import { FormsModule } from '@angular/forms';
import { TableComponent } from "../shared/table/table.component";
import { ActivatedRoute } from "@angular/router";

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
  styleUrls: ['./table-reservation.component.css'] // Use styleUrls, not styleUrl
})
export class TableReservationComponent {
  serverLink: string = "http://localhost:9500/";
  tables: Table[] = [
    { number: '1', taken: true, selected: false },
    { number: '2', taken: false, selected: false },
    { number: '3', taken: false, selected: false },
    { number: '4', taken: false, selected: false },
    { number: '5', taken: false, selected: false },
    { number: '6', taken: false, selected: false }
  ] as Table[];

  numberOfCustomers: number = 0;
  numberOfTables: number = 0;
  selectedCount: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    // Fetching tables from the server
    this.http.get<Table[]>(this.serverLink + "dining/tables").subscribe({
      next: (response: Table[]) => {
        this.tables = response;
        console.log('Fetched tables:', response);
      },
      error: (error: any) => {
        console.error("Error fetching tables:", error);
      }
    });

    // Retrieving the 'count' parameter from the route and using it as 'numberOfCustomers'
    const count = this.route.snapshot.paramMap.get('count');
    this.numberOfCustomers = count ? Number(count) : 0; // Convert the string to a number
    this.numberOfTables = Math.ceil(this.numberOfCustomers / 4); // Assuming 4 people per table
  }

  onSelectionChange() {
    this.selectedCount = this.tables.filter(table => table.selected).length;
  }
}
