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
import {OrderManagerCopyService} from "../order-manager-copy.service";

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
    tables: {
      tableNumber: number;  // Le vrai numéro de la table (YYY)
      clients: {            // Liste des clients associés à cette table
        clientId: string;   // Le numéro du client (ZZZ)
        orderId: string;    // L'ID de la commande (récupéré depuis la réponse backend)
      }[];
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
  ordersMap: OrderDictionary = {};
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router,private  serviceTable:TableService,private  orderManager:OrderManagerCopyService) { }

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
   console.log("heho",result);
    return result;
  }

  validerRepartition() {
    const tablesSelectionnees = this.tables.filter(table => table.selected);  // Tables sélectionnées
    console.log("Table Number Global:", this.tableNumberGlobal);

    const clientsRepartis = this.repartirClientsSurTables(this.numberOfCustomers, this.tableNumberGlobal, tablesSelectionnees, 4);

   // Dictionnaire pour stocker les commandes
    let clientIndex = 0;

    tablesSelectionnees.forEach((table) => {
      const commandId = this.tableNumberGlobal.toString().padStart(3, '0');  // ID global de la commande (XXX)
      const tableNumber = table.number.toString().padStart(3, '0');  // Numéro de la table (YYY)

      // Si la commande globale n'existe pas encore, on l'ajoute avec un tableau de tables
      if (!this.ordersMap[commandId]) {
        this.ordersMap[commandId] = {
          tables: []
        };
      }

      // Créer un objet pour la table actuelle
      const tableData = {
        tableNumber: Number(tableNumber),  // Le `tableNumber` reste un nombre
        clients: [] as { clientId: string; orderId: string }[]  // Type explicite pour les clients
      };

      // Variable pour suivre les clients ajoutés
      let clientsAjoutes = 0;

      // Ajouter les clients dans cette table
      for (let client = 1; client <= 4 && clientIndex < clientsRepartis.length; client++) {
        const clientNumber = client.toString().padStart(3, '0');  // Numéro du client (ZZZ)
        const complexTableNumber = Number(`${commandId}${tableNumber}${clientNumber}`);  // Numéro complexe sous forme de `number`

        clientIndex++;
        console.log(`Numéro complexe pour le client ${client}: ${complexTableNumber}`);

        // Étape 1: Créer la table avec le numéro complexe
        this.serviceTable.createTable(complexTableNumber).subscribe({
          next: (tableResponse) => {
            console.log(`Table créée avec succès: ${complexTableNumber}`, tableResponse);

            // Étape 2: Créer une commande pour cette table après sa création
            this.serviceTable.createTableOrder(complexTableNumber, 1).subscribe({
              next: (clientResponse) => {
                console.log(`Commande créée avec succès pour le client ${client} à la table ${complexTableNumber}. Réponse:`, clientResponse);

                // Ajouter les informations du client dans le tableau 'clients' de la table
                tableData.clients.push({
                  clientId: clientNumber,  // Utilisation du numéro de client (ZZZ)
                  orderId: clientResponse._id,  // ID de la commande récupéré de la réponse
                });

                clientsAjoutes++;  // Incrémenter le nombre de clients ajoutés

                // Si tous les clients pour cette table ont été ajoutés, on ajoute la table au tableau 'tables'
                if (clientsAjoutes === 4 || clientIndex === clientsRepartis.length) {
                  if (!this.ordersMap[commandId].tables.find(t => t.tableNumber === tableData.tableNumber)) {
                    this.ordersMap[commandId].tables.push(tableData);
                    console.log(`Table ajoutée à ordersMap pour la commande ${commandId}:`, this.ordersMap[commandId]);
                  }
                }
              },
              error: (error) => {
                console.error(`Erreur lors de la création de la commande pour le client ${client} à la table ${complexTableNumber}:`, error);
              }
            });
          },
          error: (error) => {
            console.error(`Erreur lors de la création de la table ${complexTableNumber}:`, error);
          }
        });
      }
    });

    console.log("Appel de generateOrderJSON avec ordersMap :", this.ordersMap);
    const ordersMapString = JSON.stringify(this.ordersMap);
    localStorage.setItem('ordersMap', ordersMapString);
  }


  navigateToNextPage() {
    this.validerRepartition();

    this.router.navigate(['/menu']);
  }

  toggleSelection(table: any) {
    if (!table.taken && !(this.selectedCount >= this.numberOfTables && !table.selected)) {
      table.selected = !table.selected;
      this.onSelectionChange();
    }
  }
}
