import {Client} from "./Client";

export interface Table{
  table: string,
  tablePaid: boolean,
  tableOrdered: boolean,
  tableNumber: number,
  clients:Client[]
}
