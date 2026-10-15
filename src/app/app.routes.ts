import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Product } from './pages/product/product';
import { Contact } from './pages/contact/contact';
import { About } from './pages/about/about';
import { Productdetails } from './pages/productdetails/productdetails';
import { Cart } from './pages/cart/cart';
import { Orders } from './pages/orders/orders';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { AdminLogin } from './pages/admin-login/admin-login';

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
    { path: 'productdetails/:id', component:Productdetails },
    { path: 'cart', component: Cart },
    { path: 'orders', component: Orders },
    { path: 'login', component: Login },
    { path: 'admin/login', component: AdminLogin },
    { path: 'admin', component: Admin },
    { path: 'admin/orders', component: Admin }
];

