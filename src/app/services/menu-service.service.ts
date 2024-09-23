import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from "rxjs";
import {MenuItem} from "../interfaces/MenuItem";

@Injectable({
  providedIn: 'root'
})
export class MenuServiceService {
public items$:BehaviorSubject<MenuItem[]>=new BehaviorSubject<MenuItem[]>([])
  constructor(private http: HttpClient) { }

  getAllItems():Observable<MenuItem[]>{
    return this.http.get<MenuItem[]>('http://localhost:9500/menu/menus');
  }
  setItems(type:string){

 this.getAllItems().subscribe(items=> {
  this.items$.next(items.filter(item => item.category === type));
 })
  }

  getItems(type: string):Observable<MenuItem[]> {
return this.items$
  }


}
