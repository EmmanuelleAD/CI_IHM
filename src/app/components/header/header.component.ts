import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterLink} from "@angular/router";
import {Category} from "../../interfaces/Category";
import {CATEGORIES} from "../../constants";
import {CategoryComponent} from "../category/category.component";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule,
    MatButtonModule, RouterLink, CategoryComponent, NgForOf],  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public  categories:Category[]=CATEGORIES
}
