import { Component, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { selectTable,unselectTable } from 'src/app/components/table-reservation/reservation.actions';
import { ReservationState } from '../../components/table-reservation/reservation.reducer'; 
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map, filter } from 'rxjs/operators';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableButtonComponent {
  @Input() number: number = 0; // Default to 0 if no number is provided
  @Input() disabled: boolean = false; // Default to false if not provided
  selectedTables$: Observable<number[]>;
  
  constructor(private readonly store: Store<{ reservation: ReservationState }>) { 
    this.selectedTables$ = this.store.select(state => state.reservation.selectedTables);
  }

  //Toggle the selection of a table with only one subscription
  toggleTableSelection(tableNumber: number) {
    this.selectedTables$.pipe(take(1)).subscribe(selectedTables => {
      if (selectedTables.includes(tableNumber)) {
        this.store.dispatch(unselectTable({ tableNumber }));
      } else {
        this.store.dispatch(selectTable({ tableNumber }));
      }
    });
  }

  // // Method to check if a table is selected
  isSelected(tableNumber: number): boolean {
    let isSelected = false;
    this.selectedTables$.pipe(take(1)).subscribe(selectedTables => {
      isSelected = selectedTables.includes(tableNumber);
    });
    return isSelected;
  }
}
