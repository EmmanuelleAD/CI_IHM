import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor() { }
  getHelloWorld(): string {
    return 'BFF HAS BEEN CALLED';
  }
}
