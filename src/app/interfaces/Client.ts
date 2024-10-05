import {Item} from "./Item";

export interface Client{
  client: string,
  clientPaid: boolean,
  clientOrdered:boolean,
  orderId:string,
  items:Item[]
}
