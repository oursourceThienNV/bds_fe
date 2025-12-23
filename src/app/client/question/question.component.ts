import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  selectOption(option: string): void {
    switch (option) {
      case 'business':
        // Navigate to create business account
        this.router.navigate(['/client/create-or-update-company']);
        break;
      case 'personal':
        // Continue with personal account
        this.router.navigate(['/client/home']);
        break;
      case 'investment':
        // Navigate to marketplace/investment opportunities
        this.router.navigate(['/client/marketplace']);
        break;
      case 'jobs':
        // Navigate to jobs/information
        this.router.navigate(['/client/marketplace']);
        break;
    }
  }

}
