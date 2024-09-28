import {Category} from "./interfaces/Category";

export const DRINKS:string="Drinks"
export const STARTERS:string="Starters"
export const MAIN:string="Main Course"
export const CATEGORIES:Category[]=[
  {
    title:"Drinks",
    path:"https://plus.unsplash.com/premium_photo-1679436985567-24325ae4bbf7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ,type:"BEVERAGE"
  },
  {
    title:"Starters",
    path:"https://st5.depositphotos.com/1027198/67803/i/380/depositphotos_678038000-stock-photo-festive-christmas-new-year-canape.jpg",
    type:"STARTER"
  },
  {
    title:"Main Courses",
    path:"https://cdn.pixabay.com/photo/2020/09/16/20/59/hamburger-5577498_1280.jpg",
    type:"MAIN"
  },
  {
    title:"Desserts",
    path:"https://img.freepik.com/photos-gratuite/mini-shortcake-aux-fraises-mignon-rose_53876-106073.jpg?t=st=1727530530~exp=1727534130~hmac=c470a0664a4cea4b51a3a9a90726eaedb65770dafde341386bbaaa9c5803dab2&w=826",
    type:"DESSERT"
  },

]
