import {Component, Input, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from "@angular/material/button";
import {NgOptimizedImage} from "@angular/common";
import {MenuServiceService} from "../../services/menu-service.service";
import {Category} from "../../interfaces/Category";
import {CATEGORIES} from "../../constants";

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, NgOptimizedImage
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})

export class CategoryComponent  implements OnInit{
  @Input() imageLink:string="https://plus.unsplash.com/premium_photo-1679436985567-24325ae4bbf7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  @Input()title :string="Drinks";
  category:Category|undefined

constructor(private menuService:MenuServiceService) {
}


  setCategory() {
    if(this.category)
      this.menuService.setItems(this.category.type)

  }

  ngOnInit(): void {
    this.category=CATEGORIES.find(category=>category.title===this.title)

  }
}
