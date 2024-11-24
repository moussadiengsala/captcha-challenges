import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgFor, MatIcon, MatCard, MatCardHeader, MatCardContent, MatCardTitle, MatCardFooter],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  steps = [
    {
      number: 1,
      title: 'Start the Challenge',
      description: 'Click the button above to begin your verification journey'
    },
    {
      number: 2,
      title: 'Complete Each Stage',
      description: 'Navigate through multiple captcha challenges'
    },
    {
      number: 3,
      title: 'View Results',
      description: 'Get instant feedback on your performance'
    }
  ];

  constructor(private router: Router) {}

  startChallenges() {
    this.router.navigate(['/challenges']);
  }
}
