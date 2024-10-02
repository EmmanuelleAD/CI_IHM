import {Command} from "../interfaces/Command";
import {createFeature, createReducer, on} from "@ngrx/store";
import * as CommandActions from './command.action'
import {OrderClient} from "../interfaces/OrderClient";
import {finishToCommandForClient, getCurrentClient} from "./command.action";
import {state} from "@angular/animations";
export interface CommandState {
  commands:Command[];
  currentClient:OrderClient|null;

}

const initialState:CommandState={
  commands:[{
    commandId:1234,
    tables: [
      {
        table: "66f0069108fb778e348bb92f",
        tablePaid: false,
        tableNumber: 1,
        tableOrdered:false,
        clients: [
          {
            client: "1",
            clientPaid: false,
            clientOrdered:false,
            items: [

            ]
          },
          {
            client: "2",
            clientPaid: false,
            clientOrdered:false,
            items: [

            ]
          },
          {
            client: "3",
            clientPaid: false,
            clientOrdered:false,
            items: [

            ]
          }, {
            client: "4",
            clientPaid: false,
            clientOrdered:false,
            items: [

            ]
          }]

      }
    ]
  }],
  currentClient:null
}
export const commandReducer=createReducer(initialState,
  on(CommandActions.getCurrentClient,(state, )=>{
   const command= state.commands.at(0)
    if(command){
      const table=command.tables.find(t=>!t.tableOrdered);
      if(table){
       const client= table.clients.find(c=>!c.clientOrdered)
        if(client){
          const currentClient:OrderClient={
            clientNumber:table.clients.indexOf(client)+1,
            tableNumber:table.tableNumber,
            commandNumber:command.commandId
          }
          return {
            ...state,currentClient
          };
        }

      }
    }
    return {
      ...state,currentClient:null
    };

    }),
  on(CommandActions.addItemForClient, (state, { tableNumber, clientIndex, item }) => {
    const command = state.commands.at(0);

    if (command) {
      const table = command.tables.find(t => t.tableNumber === tableNumber);

      if (table) {
        const client = table.clients[clientIndex - 1];

        if (client) {
          const existingItem = client.items.find(it => it.itemId === item.itemId);

          const updatedItems = existingItem
            ? client.items.map(it =>
              it.itemId === item.itemId
                ? { ...it, quantity: it.quantity + 1 }
                : it
            )
            : [...client.items, item];

          return {
            ...state,
            commands: [
              {
                ...command,
                tables: command.tables.map(t =>
                  t.tableNumber === tableNumber
                    ? {
                      ...t,
                      clients: t.clients.map((c, cIndex) =>
                        cIndex === clientIndex - 1
                          ? { ...c, items: updatedItems }
                          : c
                      ),
                    }
                    : t
                ),
              },
            ],
          };
        }
      }
    }

    return state;
  }),

  on(CommandActions.removeItemForClient, (state, { tableNumber, clientIndex, itemToRemove }) => {
    const command = state.commands.at(0);

    if (command) {
      const table = command.tables.find(t => t.tableNumber === tableNumber);

      if (table) {
        const client = table.clients[clientIndex - 1];

        if (client) {
          const moreThanOneItem = client.items.find(it => it.itemId === itemToRemove.itemId && it.quantity > 1);

          const updatedItems = moreThanOneItem
            ? client.items.map(it =>
              it.itemId === itemToRemove.itemId
                ? { ...it, quantity: it.quantity - 1 }
                : it
            )
            : client.items.filter(item => item.itemId !== itemToRemove.itemId);

          return {
            ...state,
            commands: [
              {
                ...command,
                tables: command.tables.map(t =>
                  t.tableNumber === tableNumber
                    ? {
                      ...t,
                      clients: t.clients.map((c, cIndex) =>
                        cIndex === clientIndex - 1
                          ? { ...c, items: updatedItems }
                          : c
                      ),
                    }
                    : t
                ),
              },
            ],
          };
        }
      }
    }

    return state;
  }),

  on(CommandActions.finishToCommandForClient, (state, { tableNumber, clientNumber }) => {
    const command = state.commands.at(0);

    if (command) {
      const table = command.tables.find(table => table.tableNumber === tableNumber);

      if (table) {
        const client = table.clients.at(clientNumber - 1);

        if (client) {
          const updatedClients = table.clients.map((c, cIndex) =>
            cIndex === clientNumber - 1 ? { ...c, clientOrdered: true } : c
          );

          const allClientsOrdered = updatedClients.every(c => c.clientOrdered);

          return {
            ...state,
            commands: [
              {
                ...command,
                tables: command.tables.map((t) =>
                  t.tableNumber === tableNumber
                    ? {
                      ...t,
                      clients: updatedClients,
                      tableOrdered: allClientsOrdered
                    }
                    : t
                )
              }
            ]
          };
        }
      }
    }

    return state;
  }),

  on(CommandActions.copyCommandForCurrentClient,(state,{otherClientIndex})=>{
    const command= state.commands[0]
    if(command){
      const table=command.tables.find(t=>!t.tableOrdered);
      if(table){
        const client= table.clients.find(c=>!c.clientOrdered)
        const otherClient=table.clients.at(otherClientIndex)
        if(client&&otherClient){
          const itemsForCurrent=otherClient.items
          const tableOrdered=client===table.clients.at(table.clients.length-1)
        const updatedClients=table.clients.map(c=>c===client?{...c,items:[...itemsForCurrent],clientOrdered:true,tableOrdered:tableOrdered}:c);
          const updatedTables=command.tables.map(t=>t==table?{...t,clients:updatedClients,}:t);
          return{
            ...state,
            commands:[
              {
                ...command,
                tables: updatedTables
              }
            ]
          }
        }
        }
      }
    return state;

  })
);

export const commandsFeature = createFeature({
  name: 'commands',
  reducer: commandReducer  // le reducer plus haut
});
