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

interface Table {
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string | null;
  positionX: number;
  positionY: number;
  selected?: boolean;
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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router,private  serviceTable:TableService) { }

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
      // Numéro global (par exemple 494)
      const globalPart = globalOrderNumber.toString().padStart(3, '0');

      // Numéro de la table (par exemple 002)
      const tableNumber = tables[currentTableIndex].number.toString().padStart(3, '0');

      // Numéro du client (par exemple 001)
      const clientNumber = (currentClientNumber).toString().padStart(3, '0');

      // Génère le numéro complet pour le client : "494002001"
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
    const tablesSelectionnees = this.tables.filter(table => table.selected); // Tables sélectionnées
    console.log("Table Number Global:", this.tableNumberGlobal);
    // Obtenir les numéros complexes pour chaque client
    const clientsRepartis = this.repartirClientsSurTables(this.numberOfCustomers, this.tableNumberGlobal, tablesSelectionnees, 4);

    let ordersMap: { [tableNumber: string]: { [client: string]: string }[] } = {}; // Dictionnaire pour stocker les commandes par client pour chaque table

    let clientIndex = 0; // Index pour parcourir clientsRepartis

    tablesSelectionnees.forEach((table) => {
      ordersMap[table.number] = [];
      console.log(table.number);


      this.serviceTable.createTableOrder(table.number, 1).subscribe({
        next: (response) => {
          console.log(`Table ${table.number} réservée avec succès. Réponse:`, response);

          // 2. Après avoir réservé la table, créer un ordre pour chaque client avec un numéro complexe provenant de clientsRepartis
          for (let client = 1; client <= 4 && clientIndex < clientsRepartis.length; client++) {
            const complexTableNumber = parseInt(clientsRepartis[clientIndex], 10); // Convertir en nombre
            clientIndex++; // Incrémenter l'index du client

            console.log(`Numéro complexe pour le client ${client}: ${complexTableNumber}`);

            // Créer la commande pour chaque client avec le numéro complexe
            this.serviceTable.createTable(complexTableNumber).subscribe(()=>            this.serviceTable.createTableOrder(complexTableNumber, 1).subscribe({
              next: (clientResponse) => {
                console.log(`Commande créée avec succès pour le client ${client} à la table ${table.number}. Réponse:`, clientResponse);

                // Stocker l'ID de la commande dans le dictionnaire pour cette table, avec le numéro de client
                ordersMap[table.number].push({ [`client${client}`]: clientResponse._id });
              },
              error: (error) => {
                console.error(`Erreur lors de la création de la commande pour le client ${client} à la table ${table.number}:`, error);
              }
            })
          )
          }
        },
        error: (error) => {
          console.error(`Erreur lors de la réservation de la table ${table.number}:`, error);
        }
      });
    });

    console.log("Répartition des clients avec ID de commande :", ordersMap);
  }





  navigateToNextPage() {
    this.validerRepartition();
    this.router.navigate(['/menu']);
  }
}
