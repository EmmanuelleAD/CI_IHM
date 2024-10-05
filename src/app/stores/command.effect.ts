import {inject, Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {OrderService} from "../components/orderService";
import {finishToCommandForClient, getCurrentClient} from "./command.action";
import {catchError, EMPTY, of, switchMap} from "rxjs";
import {selectCurrentClientOrder} from "./command.selectors";
import {Store} from "@ngrx/store";
import {map} from "rxjs/operators";


export const submitOrderForClient$ = createEffect(
  (actions$ = inject(Actions), commandService = inject(OrderService), store = inject(Store)) => {
    return actions$.pipe(
      ofType(finishToCommandForClient),
      switchMap(() =>
        store.select(selectCurrentClientOrder).pipe(
          switchMap(currentClientOrder => {
            if (currentClientOrder) {
              return commandService.addItemsForClient(currentClientOrder.orderId, currentClientOrder.items).pipe(
                map(() => {
                  console.log("Items added for client ",currentClientOrder.items)
                  return getCurrentClient();
                }),
                catchError(error => {
                  console.error('Erreur lors de l\'ajout des items pour le client:', error);
                  return EMPTY;
                })
              );
            }
            return EMPTY;
          })
        )
      )
    );
  },
  {functional:true}
);






