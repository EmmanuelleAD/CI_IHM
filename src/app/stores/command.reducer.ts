import {Command} from "../interfaces/Command";
import {createFeature, createReducer, on} from "@ngrx/store";
import * as CommandActions from './command.action'
import {OrderClient} from "../interfaces/OrderClient";
import {finishToCommandForClient} from "./command.action";
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
          }]

      }
    ]
  }],
  currentClient:null
}
export const commandReducer=createReducer(initialState,
  on(CommandActions.getCurrentClient,(state, {commandNumber})=>{
   const command= state.commands.find(cmd=>cmd.commandId===commandNumber)
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
  on(CommandActions.addItemForClient, (state, { commandNumber, tableNumber, clientIndex,item }) => {
    const command = state.commands.find(cmd => cmd.commandId === commandNumber);
    if (command) {
      const table = command.tables.find(t=>t.tableNumber===tableNumber);
      if (table) {
        const client=table.clients[clientIndex-1];
        if(client){
          const existingItem = client.items.find(it=> it.itemId === item.itemId);
          const updatedItems = existingItem
            ?  client.items.map(it =>
              it.itemId === item.itemId
                ? { ...it, quantity: it.quantity + 1 }  // Exemple : incrémentation de la quantité
                : it
            )
            : [...client.items,item];

            return {
              ...state,
              commands: state.commands.map(cmd =>
                cmd.commandId === commandNumber
                  ? {
                    ...cmd,
                    tables: cmd.tables.map((t) =>
                      t.tableNumber === tableNumber
                        ? {
                          ...t,
                          clients: t.clients.map((c, cIndex) =>
                            cIndex === clientIndex
                              ? {...c, items: updatedItems} // Ajouter l'item au client
                              : c
                          ),
                        }
                        : t
                    ),
                  }
                  : cmd
              ),
            };
          }



        }
      }

    return state;
  }),
  on(CommandActions.removeItemForClient,(state, { commandNumber, tableNumber, clientIndex,itemToRemove })=>{

    const command = state.commands.find(cmd => cmd.commandId === commandNumber);
    if (command) {
      const table = command.tables.find(t=>t.tableNumber===tableNumber);
      if (table) {
        const client=table.clients[clientIndex-1];
        if(client){
          const moreThanOneItem = client.items.find(it=> it.itemId === itemToRemove.itemId&&it.quantity>1);
          const updatedItems = moreThanOneItem
            ? client.items.map(it =>
              it.itemId === itemToRemove.itemId
                ? { ...it, quantity: it.quantity - 1 }  // Exemple : décrémentation de la quantité
                : it
            )
            : client.items.filter(item => item.itemId !== itemToRemove.itemId);
          return {
              ...state,
              commands: state.commands.map(cmd =>
                cmd.commandId === commandNumber
                  ? {
                    ...cmd,
                    tables: cmd.tables.map((t) =>
                      t.tableNumber === tableNumber
                        ? {
                          ...t,
                          clients: t.clients.map((c, cIndex) =>
                            cIndex === clientIndex
                              ? {...c, items: updatedItems} // Ajouter l'item au client
                              : c
                          ),
                        }
                        : t
                    ),
                  }
                  : cmd
              ),
            };
          }


          }

        }


    return state;
  }),
  on(CommandActions.finishToCommandForClient,(state,{commandNumber, tableNumber, clientNumber})=>{
    console.log("her",commandNumber, tableNumber, clientNumber)
    const command=state.commands.find(cmd=>cmd.commandId===commandNumber);
    if(command){

    const table=  command.tables.find(table=>table.tableNumber===tableNumber);
    if(table){
const client =table.clients.at(clientNumber-1);
      if(client){
        const updatedClients = table.clients.map((c, cIndex) =>
          cIndex === clientNumber - 1 ? { ...c, clientOrdered: true } : c
        );
        const allClientsOrdered = updatedClients.every(c => c.clientOrdered);
        console.log("cli",client)
        return {
          ...state,
          commands: state.commands.map(cmd =>
            cmd.commandId === commandNumber
              ? {
                ...cmd,
                tables: cmd.tables.map((t) =>
                  t.tableNumber === tableNumber
                    ? {
                      ...t,
                      clients: updatedClients,
                    tableOrdered:allClientsOrdered
                    }
                    : t
                ),
              }
              : cmd
          ),
        };
      }
    }
    }
    console.log("comm",command)
return state;
  }),
);

export const commandsFeature = createFeature({
  name: 'commands',
  reducer: commandReducer  // le reducer plus haut
});
