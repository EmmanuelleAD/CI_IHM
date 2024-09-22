import {Component, Input} from '@angular/core';
import {MatCard, MatCardTitle} from "@angular/material/card";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-table',
  standalone: true,
    imports: [
        MatCard,
        MatCardTitle,
        MatCheckbox
    ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() number:string='';
  @Input() taken:boolean=false;


}
