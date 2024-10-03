import {createAction, props} from "@ngrx/store";
import {Item} from "../interfaces/Item";

export const getCurrentClient=createAction(
  '[Command] Get current client'
);
export const addItemForClient=createAction(
  '[Command] Add item for client',
  props<{tableNumber:number;clientIndex:number;item:Item}>()

);
export const copyCommandForCurrentClient=createAction('[Command] Copy command for current client',props<{otherClientIndex:number}>());
export const removeItemForClient=createAction(
  '[Command] Remove item for client',
  props<{tableNumber:number;clientIndex:number;itemToRemove:Item}>()

);
export const finishToCommandForClient=createAction(
  '[Command] Finish to command for client',
  props<{tableNumber:number;clientNumber:number}>()

);
export const isTheFirstToCommand=createAction(
  '[Command] Get is the first to command ',props<{clientNumber:number}>()

);
