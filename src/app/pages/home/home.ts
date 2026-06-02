import { Component } from '@angular/core';
import { Carousel } from "../../carousel/carousel";

@Component({
  selector: 'app-home',
  imports: [Carousel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
