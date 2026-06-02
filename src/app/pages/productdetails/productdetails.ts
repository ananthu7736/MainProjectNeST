import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apiservice } from '../../apiservice';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productdetails.html',
  styleUrl: './productdetails.css',
})
export class Productdetails {

  productDetails: any;
  id: any;

  constructor(
    private Api: Apiservice,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.Api.getFakeProductById(this.id).subscribe((res: any) => {
      this.productDetails = res;
      this.cdr.detectChanges();
    });
  }
}