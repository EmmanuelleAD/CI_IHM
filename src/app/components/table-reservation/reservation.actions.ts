import { createAction, props } from '@ngrx/store';

export const selectTable = createAction(
  '[Reservation] Select Table',
  props<{ tableNumber: number }>()
);

export const unselectTable = createAction(
  '[Reservation] Unselect Table',
  props<{ tableNumber: number }>()
);

export const clearSelectedTables = createAction('[Reservation] Clear Selected Tables');