import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { NgForOf, NgOptimizedImage } from "@angular/common";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {TableService} from "../table.service";
import {toObservable} from "@angular/core/rxjs-interop";
import {OrderManager} from "../OrderManager";

interface Table {
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string | null;
  positionX: number;
  positionY: number;
  selected?: boolean;
}
interface OrderDictionary {
  [commandId: string]: {
    tableId: string;      // L'ID de la table (dans la base de données)
    tableNumber: number;  // Le vrai numéro de la table (YYY)
    clients: {            // Liste des clients associés à cette table
      clientId: string;   // Le numéro du client (ZZZ)
      orderId: string;    // L'ID de la commande (récupéré depuis la réponse backend)
    }[];
  };
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
  tableNumberGlobal: number = 0;  // Variable to store the global table number

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router,private  serviceTable:TableService,private  orderManager:OrderManager) { }

  ngOnInit(): void {
    this.http.get<Table[]>(this.backendUrl).subscribe({
      next: (response: Table[]) => {
        this.tables = response
          .filter(table => table.number < 100)
          .map((table, index) => ({
            ...table,
            positionX: (index % 5) * 120,
            positionY: Math.floor(index / 5) * 120
          }));
        console.log('Fetched tables from backend (filtered):', this.tables);
      },
      error: (error: any) => {
        console.error("Error fetching tables from backend:", error);
      }
    });

    const count = this.route.snapshot.paramMap.get('count');
    const tableNumberGlobal = this.route.snapshot.paramMap.get('tableNumberGlobal');

    this.numberOfCustomers = count ? Number(count) : 0;
    this.tableNumberGlobal = tableNumberGlobal ? Number(tableNumberGlobal) : 0;
    this.numberOfTables = Math.ceil(this.numberOfCustomers / 4);
  }


  onSelectionChange() {
    this.selectedCount = this.tables.filter(table => table.selected).length;
  }



  repartirClientsSurTables(totalClients: number, globalOrderNumber: number, tables: Table[], clientsParTable: number): string[] {
    const result: string[] = [];
    let currentTableIndex = 0;
    let currentClientNumber = 1;

    for (let client = 1; client <= totalClients; client++) {

      const globalPart = globalOrderNumber.toString().padStart(3, '0');


      const tableNumber = tables[currentTableIndex].number.toString().padStart(3, '0');

      const clientNumber = (currentClientNumber).toString().padStart(3, '0');


      const tableClientNumber = `${globalPart}${tableNumber}${clientNumber}`;
      console.log(tableClientNumber);
      result.push(tableClientNumber);

      // Si on a atteint le nombre max de clients pour la table, passe à la table suivante
      if (currentClientNumber === clientsParTable) {
        currentClientNumber = 1;
        currentTableIndex++;
      } else {
        currentClientNumber++;
      }
    }

    return result;
  }
  validerRepartition() {
    const tablesSelectionnees = this.tables.filter(table => table.selected);  // Tables sélectionnées
    console.log("Table Number Global:", this.tableNumberGlobal);


    const clientsRepartis = this.repartirClientsSurTables(this.numberOfCustomers, this.tableNumberGlobal, tablesSelectionnees, 4);

    let ordersMap: OrderDictionary = {};

    let clientIndex = 0;

    tablesSelectionnees.forEach((table) => {
      const commandId = this.tableNumberGlobal.toString().padStart(3, '0');
      const tableNumber = table.number;
      const tableId = table._id;
      if (!ordersMap[commandId]) {
        ordersMap[commandId] = {
          tableId: tableId,
          tableNumber: tableNumber,
          clients: []
        };
      }


      for (let client = 1; client <= 4 && clientIndex < clientsRepartis.length; client++) {
        const complexTableNumber = parseInt(clientsRepartis[clientIndex], 10);
        const clientId = complexTableNumber.toString().slice(-3);
        clientIndex++;
        console.log(`Numéro complexe pour le client ${client}: ${complexTableNumber}`);

        this.serviceTable.createTableOrder(complexTableNumber, 1).subscribe({
          next: (clientResponse) => {
            console.log(`Commande créée avec succès pour le client ${client} à la table ${tableNumber}. Réponse:`, clientResponse);


            ordersMap[commandId].clients.push({
              clientId: clientId,
              orderId: clientResponse._id
            });
          },
          error: (error) => {
            console.error(`Erreur lors de la création de la commande pour le client ${client} à la table ${tableNumber}:`, error);
          }
        });
      }
    });
    this.orderManager.generateOrderJSON(ordersMap);

    console.log("Répartition des clients avec ID de commande :", ordersMap);
  }




  navigateToNextPage() {
    this.validerRepartition();

    this.router.navigate(['/menu']);
  }
}
