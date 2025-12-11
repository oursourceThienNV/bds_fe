import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../../core/services/services-app/company.service';
import { UserProfileService } from '../../../core/services/user.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-client-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  companies: any[] = [];
  userId: number | null = null;
  userName: string = 'Người dùng';
  userAvatar: string = 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&size=48';

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private userService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.getUserIdFromToken();
    this.loadUserProfile();
    this.loadCompanies();
  }

  getUserIdFromToken(): void {
    try {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const decodedToken: any = jwtDecode(authData);
        this.userId = decodedToken.userId;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  loadUserProfile(): void {
    // Check if name and avatar exist in localStorage
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');

    if (storedName && storedAvatar) {
      // Use cached data from localStorage
      this.userName = storedName;
      this.userAvatar = storedAvatar;
    } else if (this.userId) {
      // Fetch from API if not in localStorage
      this.userService.getUserById({ id: this.userId }).subscribe({
        next: (response: any) => {
          if (response?.body?.responseCode === '200') {
            const userData = response.body.body;

            // Set user name
            this.userName = userData.fullname || userData.username || 'Người dùng';

            // Set user avatar
            if (userData.logoUrl) {
              this.userAvatar = environment.apiUrl + userData.logoUrl;
            } else {
              // Generate avatar from name
              const nameForAvatar = encodeURIComponent(this.userName);
              this.userAvatar = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=4f46e5&color=fff&size=48`;
            }

            // Save to localStorage for future use
            localStorage.setItem('userName', this.userName);
            localStorage.setItem('userAvatar', this.userAvatar);
          }
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          // Use default values on error
          this.userName = 'Người dùng';
          this.userAvatar = 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&size=48';
        }
      });
    }
  }

  loadCompanies(): void {
    if (!this.userId) {
      return;
    }

    this.companyService.getListCompanyByUserId({ userId: this.userId }).subscribe(
      (response: any) => {
        this.companies = response?.body?.body || [];
        for (let company of this.companies) {
          company.logoUrl = company.logoUrl && environment.apiUrl + company.logoUrl;
        }
      },
      (error) => {
        console.error('Error loading companies:', error);
      }
    );
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality
    }
  }

  goToFranchise(): void {
    this.router.navigate(['/client/franchise']);
  }

  openNotifications(): void {
    console.log('Open notifications');
  }

  goToCreateCompany(): void {
    this.router.navigate(['/client/create-or-update-company']);
  }

  goToEditCompany(companyId: number): void {
    this.router.navigate(['/client/company', companyId]);
  }

  goToUserProfile(): void {
    if (this.userId) {
      this.router.navigate(['/client/user', this.userId]);
    }
  }

  goToProfile(): void {
    this.router.navigate(['/client/update-user']);
  }
}
