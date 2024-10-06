import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectTable, unselectTable } from '../../components/table-reservation/reservation.actions';

import { TableButtonComponent } from "../../shared/table/table.component";
import { ReservationState } from "../table-reservation/reservation.reducer";

import {OrderService} from "../orderService";


@Component({
  standalone: true,
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  imports: [TableButtonComponent, CommonModule]
})
export class PaymentMethodComponent implements OnInit {

  commandId: number | null = null;
  selectedTable: number | null = null;
  selectedTables$: Observable<number[]>; // Déclaration d'Observable sans initialisation immédiate
  tables: Array<any> = [];
  payTablesBill: Array<any> = [];
  tablesTotal: number = 0;
  commandIdGlobal:string | null;

  payAll: boolean = false;
  serverLink: string = 'http://localhost:3001/';
  showAlert = false;
  alertMessage: string = '';

  ordersMap: { [key: string]: any } = {};
  ordersMapTables: number[]= [];

  // Utilisation de readonly pour garantir que 'store' est injecté et ne change pas après
  constructor(
    private readonly route: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly store: Store<{ reservation: ReservationState }>,private router: Router,private orderService:OrderService
  ) {
    this.selectedTables$ = this.store.select(state => state.reservation.selectedTables);
    this.commandIdGlobal = this.route.snapshot.paramMap.get('count');
    console.log(this.commandIdGlobal);


  }

  ngOnInit(): void {
    this.orderService.filterAndOrganizeOrders(this.commandIdGlobal!).subscribe({
      next: (ordersMap) => {
        this.ordersMap = ordersMap;
               this.ordersMapTables = Object.keys(ordersMap).map(key => parseInt(key, 10));
        Object.keys(ordersMap).forEach(tableNumber => {
          this.ordersMap[tableNumber]['tableTotal'] = 0;
          this.ordersMap[tableNumber]['tablePaid'] = this.ordersMap[tableNumber]['clients'].every((client: any) => {
            return client.clientPaid === true;
          });

          this.ordersMap[tableNumber]['clients'].forEach((client: any) => {
            // Get client order details

            client["total"]=0 ;
            this.httpClient.get(`${this.serverLink}tableOrders/${client.orderId}`).pipe(take(1)).subscribe({
              next: (clientOrder: any) => {
                client['order'] = clientOrder;
                // Get details of each order line item
                clientOrder.lines.forEach((item: any) => {
                  this.httpClient.get(`http://localhost:3000/menus/${item["item"]["_id"]}`).pipe(take(1)).subscribe({
                    next: (menuItem: any) => {
                      client["total"]+=menuItem["price"]*item["howMany"];
                    },
                    error: (err) => {
                      console.error(`Error fetching menu item ${item._id}:`, err);
                    }
                  });
                });
                this.ordersMap[tableNumber]['tableTotal'] += client["total"];

              },
              error: (err) => {
                console.error(`Error fetching client order ${client.orderId}:`, err);
              }
            });
          });
        })
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
      }
    });
  }


  loadClientsFromReservations(): void {
    console.log("order Map ", this.ordersMap);
  }
  toggleTableSelection(tableNumber: number) {
    this.selectedTables$.pipe(take(1)).subscribe(selectedTables => {
      if (selectedTables.includes(tableNumber)) {
        this.store.dispatch(unselectTable({ tableNumber }));
      } else {
        this.store.dispatch(selectTable({ tableNumber }));
      }
    });
  }


  selectTable(table: number, tablePaid: boolean, tableObj:boolean): void {
    console.log("selecting table to pay");
    console.log(tablePaid);
    console.log(tableObj);
    if (tablePaid) {
      this.triggerAlert('table already paid');
    } else {
      this.closeAlert();
      this.selectedTables$.pipe(take(1)).subscribe({
        next: (selectedTables) => {
          console.log('Selected Tables:', selectedTables);
          if (selectedTables.length === 1) {
            this.selectedTable = table;
            this.payAll = false;
          } else if (selectedTables.length > 1) {
            this.selectedTable = null;
            this.payAll = true;
            this.calculateTotal(selectedTables);
          } else {
            this.payAll = false;
            this.selectedTable = null;
          }
        },
        error: (error) => {
          console.log('Erreur dans selectedTables$', error);
        }
      });
    }
  }

  choosePaymentMethod(method: 'whole' | 'individual' | 'multipleTables'): void {
    this.router.navigate(['/payment-review', this.commandIdGlobal,this.selectedTable]);
  }

  calculateTotal(selectedTables: number[]): void {
    this.payTablesBill = [];
    selectedTables.forEach(tableNumber => {
      const tableBill :any = {}
      tableBill['tableTotal'] = this.ordersMap[tableNumber]["tableTotal"];
      tableBill['tableNumber'] = tableNumber;
      this.tablesTotal += tableBill['tableTotal'];
      tableBill['clients'] = this.ordersMap[tableNumber]["clients"];
      this.payTablesBill .push(tableBill)


    })
  }

  processPayment(): void {
    console.log('Traitement du paiement pour les tables sélectionnées...');
    this.selectedTables$.pipe(take(1)).subscribe({
      next: (selectedTables) => {
        console.log('Tables sélectionnées:', selectedTables);
        selectedTables.forEach(selectedTable =>{
          this.ordersMap[selectedTable]['clients'].forEach((client:any) => {
            this.httpClient.post(`${this.serverLink}tableOrders/${client['orderId']}/bill`,{}).subscribe({
              next: (response) => {
                this.ngOnInit();
              },
              error: (error) => this.logError(error)
            });

          });
        });
      },
      error: (error) => this.logError(error)
    });

  }

  triggerAlert(alertMessage: string): void {
    this.alertMessage = alertMessage;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  logError(error: any): void {
    console.error('Erreur détectée:', error);

  }
  GoHome(){
    this.router.navigateByUrl('');
  }
}
