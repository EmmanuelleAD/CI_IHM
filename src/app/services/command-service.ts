import {Injectable} from "@angular/core";
import {Command} from "../interfaces/Command";
import {BehaviorSubject, Observable} from "rxjs";
import {Table} from "../interfaces/Table";
import {OrderClient} from "../interfaces/OrderClient";

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  currentCommand:Command={
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
};
  currentCommand$:BehaviorSubject<Command|null>=new BehaviorSubject<Command|null>(null);
currentTable:Table|null=null;
  currentClientIndex:number=0;
  currentTableIndex :number=0


  setCurrentCommand(command:Command){
    this.currentCommand=command
    this.currentCommand$.next(this.currentCommand);
    this.currentTableIndex=0;
    this.currentClientIndex=0;
  }
  getCurrentClient():OrderClient{
    return {
      tableNumber:this.currentCommand.tables[this.currentTableIndex].tableNumber,
      clientNumber:this.currentClientIndex+1
    }
  }
  addItemForCurrentClient(){

  }




}
