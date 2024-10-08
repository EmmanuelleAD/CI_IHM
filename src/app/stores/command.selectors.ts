import {CommandState} from "./command.reducer";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {ClientPosition} from "../interfaces/ClientPosition";
import {ClientOrder} from "../interfaces/ClientOrder";

export interface AppState {
  commandState: CommandState;
}
export const selectCommandState = createFeatureSelector<CommandState>('commands')

export const selectCommands = createSelector(selectCommandState,
  (state:CommandState)=>state.commands)
export const selectTable=(commandNumber: number,tableNumber:number)=>createSelector(selectCommands,
  (commands)=>{

const command= commands.find(com=>com.commandId===commandNumber);
if(command){
  return command.tables.find(table=>table.tableNumber===tableNumber)

}
    return null

  })
export const selectCurrentClient=
  createSelector(selectCommands,
    (commands) => {
      if (commands&&commands.length > 0) {

        const command = commands[0];
        const table = command.tables.find(t => !t.tableOrdered);
        if (table) {
          const client = table.clients.find(c => !c.clientOrdered);
          if (client) {
            const currentClient: ClientPosition = {
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
export const isTheLast=
  createSelector(selectCommands,
    (commands) => {
      if (commands&&commands.length > 0) {

        const command = commands[0];
        const table = command.tables.find(t => !t.tableOrdered);
        if (table) {
          const client = table.clients.find(c => !c.clientOrdered);
          if (client) {
            const currentClient: ClientPosition = {
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
export const selectCommandNumber=
  createSelector(selectCommands,
    (commands) => {
      if (commands&&commands.length > 0) {
            return commands[0].commandId;
      }
      return -1;
    });

export const selectCurrentClientOrder=
  createSelector(selectCommands,
    (commands) => {
      if (commands&&commands.length > 0) {

        const command = commands[0];
        const table = command.tables.find(t => !t.tableOrdered);
        if (table) {
          const client = table.clients.find(c => !c.clientOrdered);
          if (client) {
            return {
              orderId: client.orderId,
              items: client.items
            } as ClientOrder;
          }
        }
      }
      return null;
    });
export const selectClientOrder=(tableNumber:number,clientNumber:number)=>
  createSelector(selectCommands,
    (commands) => {
      if (commands&&commands.length > 0) {

      const table= commands[0].tables.find(t=>t.tableNumber===tableNumber);
      if(table)
        return table.clients[clientNumber-1];
    }
  return null});
export const selectIsTheFirstToCommand = (commandNumber: number, clientNumber: number)=>
  createSelector(
  selectCommands,
  (commands) => {
    const command = commands.find(command => command.commandId === commandNumber);
    if (command) {
      for (const table of command.tables) {
        for (const client of table.clients) {
          if (table.clients.indexOf(client) === clientNumber - 1) {
            return true;

          }
         else if(client.clientOrdered) {
            return false
          }
        }
      }
    }

    return true;
  }
);
