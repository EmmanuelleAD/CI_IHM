import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { TableButtonComponent } from "../../shared/table/table.component";
import { ReservationState } from "../table-reservation/reservation.reducer";
import { clearSelectedTables } from "../table-reservation/reservation.actions";

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

  payAll: boolean = false;
  serverLink: string = 'http://localhost:3003/dining';
  showAlert = false;
  alertMessage: string = '';

  // Utilisation de readonly pour garantir que 'store' est injecté et ne change pas après
  constructor(
    private readonly route: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly store: Store<{ reservation: ReservationState }>
  ) {
    // Initialisation de selectedTables$ après injection de store
    this.selectedTables$ = this.store.select(state => state.reservation.selectedTables);
  }

  ngOnInit(): void {
    console.log('##### ON INIT');
    this.route.params.pipe(take(1)).subscribe(params => {
      const commandIdParam = params['commandId'];
      this.commandId = commandIdParam ? Number(commandIdParam) : null;
      if (this.commandId) {
        this.loadClientsFromReservations(this.commandId);
      }
    });
  }

  loadClientsFromReservations(commandId: number): void {
    this.httpClient.get<any>(`${this.serverLink}/command/${commandId}/tables`).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.tables = response.tables || [];
        console.log(this.tables);
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des tables:', error);
      }
    });
  }

  selectTable(table: number, tablePaid: boolean): void {
    if (tablePaid) {
      this.triggerAlert('Table déjà payée');
    } else {
      this.closeAlert();
      this.selectedTables$.pipe(take(1)).subscribe({
        next: (selectedTables) => {
          console.log('Tables sélectionnées:', selectedTables);
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
    // Redirection ou gestion du mode de paiement
  }

  calculateTotal(selectedTables: number[]): void {
    this.httpClient.post(`${this.serverLink}/payment/byTable`, {
      commandId: this.commandId,
      selectedTables
    }).pipe(take(1)).subscribe({
      next: (response: any) => {
        console.log(response);
        this.payTablesBill = response.tablesBill || [];
        this.tablesTotal = response.commandTotal || 0;
      },
      error: (error) => {
        console.log('Erreur lors du calcul du total:', error);
      }
    });
  }

  processPayment(): void {
    console.log('Traitement du paiement pour les tables sélectionnées...');
    this.selectedTables$.pipe(take(1)).subscribe({
      next: (selectedTables) => {
        console.log('Tables sélectionnées:', selectedTables);
        this.httpClient.post(`${this.serverLink}/payment/process/byTables`, {
          commandId: this.commandId,
          paidTables: selectedTables
        }).subscribe({
          next: (response) => {
            console.log('Paiement traité avec succès:', response);
            this.store.dispatch(clearSelectedTables());
            this.ngOnInit();
          },
          error: (error) => this.logError(error)
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
}
