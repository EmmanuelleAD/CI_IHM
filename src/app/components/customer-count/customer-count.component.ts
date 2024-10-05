import {Component, inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Table } from '../../model/model';
import { TableService } from '../table.service';
import {setCommands} from "../../stores/command.action";
import {OrderService} from "../orderService";
import {Store} from "@ngrx/store";

@Component({
  selector: 'app-customer-count',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './customer-count.component.html',
  styleUrl: './customer-count.component.css'
})

export class CustomerCountComponent {
  count: string = '0';
  type:string = "";
  serverLink: string = "http://localhost:9500/";
  tables: Table[] = [] as Table[];
  countEmptyTables:number=0;
  private store=inject(Store);
  requiredNumberOfTables:number=0;
  tableNumber: string = '';  // Numéro de table généré sous forme "XXX"
  createdOrder: any; // Pour stocker la commande créée
  existingTableNumbers: string[] = []; // Stocke les numéros de tables existantes
  constructor(private router: Router,  private tableService: TableService, private route: ActivatedRoute,private http: HttpClient,private snackBar: MatSnackBar,private orderService:OrderService) {
    this.route.data.subscribe(data => {
      this.type = data['type'];
    });
  }

  ngOnInit(): void {
    if (this.type=="customerCount") {
      this.http.get<Table[]>(this.serverLink + "dining/tables").subscribe({
        next: (response: Table[]) => {
          this.tables = response;
          console.log(response);
          this.countEmptyTables = this.tables.filter(table => !table.taken).length;
        },
        error: (error: any) => {
          console.log("Error fetching tables", error);
        }
      });
    }
  }
  openSnackBar(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000, // Duration in milliseconds
      horizontalPosition: 'right', // Can be 'start', 'center', 'end', 'left', or 'right'
      verticalPosition: 'top', // Can be 'top' or 'bottom'
    });
  }
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

  generateUniqueTableNumber(): string {
    let tableNumber: string;
    do {
      tableNumber = Math.floor(100 + Math.random() * 900).toString(); // Génére un nombre entre 100 et 999
    } while (this.existingTableNumbers.includes(tableNumber));  // Vérifie si le numéro existe déjà
    return tableNumber;
  }
  validateButton() {
    console.log("typesss");
    console.log(this.type);
    if (this.type == "customerCount") {
      this.requiredNumberOfTables=Math.ceil(parseInt(this.count, 10) / 4);
      if(this.requiredNumberOfTables>this.countEmptyTables){
        console.log("too many clients");
        this.openSnackBar("There is not enough available tables,please wait!");
      }
      else{
        const customersCount = parseInt(this.count);  // Récupère le nombre de clients sous forme numérique

        this.tableService.getAllTables().subscribe(tables => {
          // Stocke tous les numéros de tables existants
          this.existingTableNumbers = tables.map((table: any) => table.number);


          this.tableNumber = this.generateUniqueTableNumber();

          // Crée ensuite la table
          this.createTable(this.tableNumber, customersCount);
          this.router.navigate(['/table-reservation', this.count,this.tableNumber]);
        });
      }
    }
    else{
      this.router.navigate(['/payment-method', this.count]).then(()=>this.orderService.filterAndOrganizeOrders(this.count).subscribe(ordersMap=>{
        this.store.dispatch(setCommands({orderDictionary:ordersMap}))
        console.log("order",ordersMap)
      }));
    }

  }

  // Crée la table et l'ordre global
  createTable(tableNumber: string, customersCount: number) {
    this.tableService.createTable(parseInt(tableNumber)).subscribe(response => {
      console.log('Table créée avec succès', response);
      console.log(response.number, customersCount)
      this.createTableOrder(response.number, customersCount);
    });
  }
  createTableOrder(tableNumber: string, customersCount: number) {
    const tableNumberInt = parseInt(tableNumber, 10);  // Conversion

    console.log('Envoi de la requête avec les données:', { tableNumber: tableNumberInt, customersCount });

    this.tableService.createTableOrder(tableNumberInt, customersCount).subscribe(
      (order) => {
        console.log('Ordre global créé avec succès', order);
        this.createdOrder = order;
      },
      (error) => {
        console.error('Erreur lors de la création de la commande:', error);
      }
    );
  }
}
