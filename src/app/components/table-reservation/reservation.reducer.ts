import { createReducer, on } from '@ngrx/store';
import { selectTable, unselectTable, clearSelectedTables } from './reservation.actions';

export interface ReservationState {
  selectedTables: number[];
}

export const initialState: ReservationState = {
  selectedTables: []
};

export const reservationReducer = createReducer(
  initialState,
  on(selectTable, (state, { tableNumber }) => ({
    ...state,
    selectedTables: [...state.selectedTables, tableNumber]
  })),
  on(unselectTable, (state, { tableNumber }) => ({
    ...state,
    selectedTables: state.selectedTables.filter(num => num !== tableNumber)
  })),
  on(clearSelectedTables, (state) => ({
    ...state,
    selectedTables: [] 
  }))

);
