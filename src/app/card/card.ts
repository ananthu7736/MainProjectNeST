import { Component } from '@angular/core';
import { Input } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() product: any;
}
