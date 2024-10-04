import { createReducer, on } from '@ngrx/store';
import { selectTable, unselectTable, clearSelectedTables } from './reservation.actions';
import {createFeature} from "@ngrx/store";

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

export const reservationFeature = createFeature({
  name: 'reservation',
  reducer: reservationReducer  // le reducer plus haut
});


