import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemsOrderedComponent } from '../items-ordered/items-ordered.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ItemsOrderedComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front';
}
