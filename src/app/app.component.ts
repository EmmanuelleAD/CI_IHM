
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from '@services/test.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: string;

  constructor(private testService: TestService) {
    this.title = this.testService.getHelloWorld(); // Use 'this' to refer to the class property
  }
}
