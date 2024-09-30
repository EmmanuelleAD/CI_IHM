import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MenuServiceService {

  constructor(private http: HttpClient) { }

  getAllItems(){
    return this.http.get('http://localhost:9500/menu/menus');
  }

  getItems(type: string) {

  }


}
