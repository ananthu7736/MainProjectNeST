import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Product } from './pages/product/product';
import { Contact } from './pages/contact/contact';
import { About } from './pages/about/about';
import { Productdetails } from './pages/productdetails/productdetails';
export const routes: Routes = [
    {
        path: '',component:Home
    },
    {
       path:'product',component:Product
    },
    {
       path:'contact',component:Contact
    },
    {
       path:'about',component:About
    },
    { path: 'productdetails/:id', component:Productdetails }
];
