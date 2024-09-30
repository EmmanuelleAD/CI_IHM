
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {TestService} from "./services/wf_services/test.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: string;

  constructor(private testService: TestService, private modalService: NgbModal) {
    this.title = this.testService.getHelloWorld(); // Use 'this' to refer to the class property
  }

  public open(modal: any): void {
    this.modalService.open(modal);
  }
}


