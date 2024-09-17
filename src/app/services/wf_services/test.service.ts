import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor() { }

  getHelloWorld(): string {
    return 'WF SERVICE HAS BEEN CALLED';
  }
}
