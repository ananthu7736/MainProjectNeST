import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Carousel } from './carousel/carousel';
import { About } from './pages/about/about';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Carousel,About],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('NeSTmainproject');
}
