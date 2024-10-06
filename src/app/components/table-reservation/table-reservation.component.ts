import {Component, inject, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { NgForOf, NgOptimizedImage } from "@angular/common";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {TableService} from "../table.service";
import {Store} from "@ngrx/store";
import { setCommands} from "../../stores/command.action";
import { forkJoin, Observable, of, switchMap, tap} from "rxjs";
import {OrderService} from "../orderService";
import {map} from "rxjs/operators";

export   interface ClientDto {            // Liste des clients associés à cette table
  clientId: string;   // Le numéro du client (ZZZ)
  orderId: string;    // L'ID de la commande (récupéré depuis la réponse backend)
}

interface Table {
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string | null;
  positionX: number;
  positionY: number;
  selected?: boolean;
  clients: ClientDto[];
}

export interface TableDto {
  tableNumber: number;  // Le vrai numéro de la table (YYY)
  clients: ClientDto[];
}
export  interface TablesDto{
 tables: TableDto[]
}
export interface OrderDictionary {
  [tableNumber: number]:
   TableDto
  ;
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
export class TableReservationComponent implements OnInit{
  backendUrl: string = "http://localhost:3001/tables";  // Backend URL
  tables: Table[] = [];  // Array of tables
  numberOfCustomers: number = 0;
  numberOfTables: number = 0;
  selectedCount: number = 0;
  tableNumberGlobal: number = 0;  // Variable to store the global table number

  private store=inject(Store);
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router,private  serviceTable:TableService,private  orderService:OrderService) { }

  ngOnInit(): void {
    this.getRealTables();
    const count = this.route.snapshot.paramMap.get('count');
    const tableNumberGlobal = this.route.snapshot.paramMap.get('tableNumberGlobal');
    this.numberOfCustomers = count ? Number(count) : 0;
    this.tableNumberGlobal = tableNumberGlobal ? Number(tableNumberGlobal) : 0;
    if(tableNumberGlobal)
      this.orderService.globalOrderPrefix.next(tableNumberGlobal);
    this.numberOfTables = Math.ceil(this.numberOfCustomers / 4);
  }


  private getRealTables() {
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
  }

  onSelectionChange() {
    this.selectedCount = this.tables.filter(table => table.selected).length;
  }



  repartirClientsSurTables(totalClients: number, globalOrderNumber: number, clientsParTable: number): Observable<any> {
    const tablesSelectionnees = this.tables.filter(table => table.selected);
    const globalPart = globalOrderNumber.toString().padStart(3, '0');
    const observables:Observable<any>[] = [];

    tablesSelectionnees.forEach((t => {
      const clientsLimit = (t === tablesSelectionnees[tablesSelectionnees.length - 1] && totalClients % clientsParTable) ? totalClients % clientsParTable : clientsParTable;
this.serviceTable.createTableOrder(t.number,1).subscribe();
      for (let client = 1; client <= clientsLimit; client++) {
        const tableNumber = t.number.toString().padStart(3, '0');
        const clientNumber = (client).toString().padStart(3, '0');
        const commandIdForClientString = `${globalPart}${tableNumber}${clientNumber}`;
        const commandIdForClient = Number(commandIdForClientString);

        // Pousse les observables pour `createTable` et `createTableOrder`
        const observable = this.serviceTable.createTable(commandIdForClient).pipe(
          switchMap((tableResponse) => {
            console.log(`Table créée avec succès pour le client : ${commandIdForClient}`, tableResponse);

            // Une fois la table créée, on crée une commande pour cette table
            return this.serviceTable.createTableOrder(commandIdForClient, 1).pipe(
              map(clientResponse => {
                console.log('Commande client créé  avec succès:', clientResponse._id,clientResponse);
                return {
                  tableNumber: t.number,
                  clientId: clientNumber,
                  orderId: clientResponse._id
                };
              })
            );
          })
        );

        observables.push(observable);
      }
    }));

    return forkJoin(observables).pipe();

  }


  navigateToNextPage() {
    this.repartirClientsSurTables(this.numberOfCustomers,this.tableNumberGlobal,4).subscribe(()=>{
      this.router.navigate(['/table-categories']).then(()=>this.orderService.filterAndOrganizeOrders(this.tableNumberGlobal.toString()).subscribe(ordersMap=>{
        this.store.dispatch(setCommands({orderDictionary:ordersMap,commandNumber:this.tableNumberGlobal}))
      }));

    })
  }

  toggleSelection(table: any) {
    if (!table.taken && !(this.selectedCount >= this.numberOfTables && !table.selected)) {
      table.selected = !table.selected;
      this.onSelectionChange();
    }
  }
}
