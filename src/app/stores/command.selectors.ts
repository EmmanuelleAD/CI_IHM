import {CommandState} from "./command.reducer";
import {state} from "@angular/animations";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {OrderClient} from "../interfaces/OrderClient";
import {getCurrentClient} from "./command.action";
export interface AppState {
  commandState: CommandState;
}
export const selectCommandState = createFeatureSelector<CommandState>('commands')

export const selectCommands = createSelector(selectCommandState,
  (state:CommandState)=>state.commands)
export const selectCurrentClient=
  createSelector(selectCommands,
    (commands) => { console.log("com",commands)
      if (commands&&commands.length > 0) {

        const command = commands[0]; // Vous pouvez ajuster cette logique selon vos besoins
        const table = command.tables.find(t => !t.tableOrdered);
        if (table) {
          const client = table.clients.find(c => !c.clientOrdered);
          if (client) {
            // Renvoie du client avec les infos nécessaires
            const currentClient: OrderClient = {
              clientNumber: table.clients.indexOf(client) + 1,
              tableNumber: table.tableNumber,
              commandNumber: command.commandId
            };
            return currentClient;
          }
        }
      }
      return null;
    });
