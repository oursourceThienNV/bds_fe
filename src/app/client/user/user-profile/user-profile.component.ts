import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userId: string;
  apiUrl = environment.apiUrl;
  isLoading = false;
  showOptionsMenu = false;

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.position-relative');
    if (!clickedInside && this.showOptionsMenu) {
      this.showOptionsMenu = false;
    }
  }

  // User data
  user: any = {
    logo: '',
    coverPhoto: '',
    fullname: '',
    username: '',
    tagline: '',
    location: '',
    followers: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  };

  // Followers (Demo data - similar to team members in company profile)
  followers = [
    {
      name: 'Jane Doe',
      position: 'Giám đốc điều hành',
      description: 'Jane đưa sáng tạo và sự đầy cảm hứng',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      link: '#'
    },
    {
      name: 'John Smith',
      position: 'Giám đốc công nghệ',
      description: 'John sở hữu những phân tích về kiến trúc',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      link: '#'
    }
  ];

  // Partner companies (Demo)
  companies = [
    {
      name: 'TechCorp Inc.',
      description: 'Đối tác công nghệ chiến lược',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
      link: '#'
    },
    {
      name: 'CloudPioneers',
      description: 'Đối tác giải pháp Cloud',
      logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      link: '#'
    }
  ];

  // Work experience / Skills
  skills = [
    'FinTech',
    'SaaS',
    'HealthTech',
    'EdTech',
    'AI & Machine Learning',
    'Blockchain',
    'Nền tảng Tài trưởng'
  ];

  // Contact info getter
  get contactInfo() {
    return {
      email: this.user.email || 'vuan.investor@gmail.com',
      linkedin: 'linkedin.com/in/vuaninvestor',
      twitter: '@vuan_investor'
    };
  }

  // Gallery
  gallery = [
    { type: 'image', title: 'Tất cả bài viết', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop' },
    { type: 'image', title: 'Decor', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=400&fit=crop' },
    { type: 'image', title: 'Web', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getUserById({ id: parseInt(this.userId) }).subscribe({
      next: (response) => {
        if (response.body && response.body.responseCode === '200') {
          const data = response.body.body;
          console.log('User data:', data);
          this.user = {
            logo: data.logoUrl ? (data.logoUrl.startsWith("/uploads") ? this.apiUrl : "") + data.logoUrl : 'https://randomuser.me/api/portraits/women/65.jpg',
            coverPhoto: data.coverPhotoUrl ? (data.coverPhotoUrl.startsWith("/uploads") ? this.apiUrl : "") + data.coverPhotoUrl : 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
            fullname: data.fullname || 'User Name',
            username: data.username || '',
            tagline: 'Nhà đầu tư thiên thần — Hà Nội',
            location: data.city || data.address || 'Hà Nội',
            followers: '1,200 người theo dõi',
            description: data.description || 'Vũ An là một nhà đầu tư thiên thần tập trung vào các startups công nghệ giai đoạn đầu tại Đông Nam Á. Với hơn 15 năm kinh nghiệm trong lĩnh vực đầu tư và phát triển sản phẩm, tôi mong muốn đồng hành cùng các nhà sáng lập để đưa dựng những công ty có tầm ảnh hưởng lớn.',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || ''
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      }
    });
  }

  followUser(): void {
    // TODO: Implement follow functionality
    console.log('Following user...');
  }

  sendMessage(): void {
    // TODO: Implement send message functionality
    console.log('Send message...');
  }

  viewAllFollowers(): void {
    // TODO: Navigate to followers page
    console.log('View all followers');
  }

  viewAllGallery(): void {
    // TODO: Navigate to gallery page
    console.log('View all gallery');
  }

  toggleOptionsMenu(): void {
    this.showOptionsMenu = !this.showOptionsMenu;
  }

  editProfile(): void {
    this.showOptionsMenu = false;
    this.router.navigate(['/client/update-user']);
  }
}
