import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Apiservice {
    constructor(private http: HttpClient) {}
    getFakeProducts() {
    return this.http.get('https://dummyjson.com/products');
}
getFakeProductById(id: string) {
  return this.http.get(`https://dummyjson.com/products/${id}`);
}
}
