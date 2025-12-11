import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from 'src/app/core/services/services-app/company.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit {
  companyId: string;
  apiUrl = environment.apiUrl;
  isLoading = false;
  showEditPopup = false;

  // Company data
  company: any = {
    logo: '',
    coverPhoto: '',
    name: '',
    tagline: '',
    location: '',
    size: '',
    established: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: ''
  };

  // Team members
  teamMembers = [
    {
      name: 'Jane Doe',
      position: 'Giám đốc điều hành',
      description: 'Jane đưa sáng tạo và sự đầy cảm hứng cho công việc của mình',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      link: '#'
    },
    {
      name: 'John Smith',
      position: 'Giám đốc công nghệ',
      description: 'John sở hữu những phân tích và kinh nghiệm về kiến trúc và kỹ thuật',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      link: '#'
    }
  ];

  // Partner companies
  partners = [
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

  // Reviews
  reviews = [
    {
      author: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      rating: 5,
      date: 'Gần đây',
      comment: 'InnovateTech đã chuyển đổi hoạt động của chúng tôi thành công. Đội ngũ chuyên nghiệp và rất tận tâm!'
    },
    {
      author: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      rating: 5,
      date: '11 tháng 10, 2023',
      comment: 'Thực tiễn trong cả về cả chuyển nghiệp về phát triển tập phần – kỹ sản quá tốt, duy trí tốt thực tốt rõ ràng.'
    }
  ];

  // Contact info getter
  get contactInfo() {
    return {
      phone: this.company.phone || '+1 (555) 123-4567',
      email: this.company.email || 'contact@innovatetech.com',
      website: this.company.website || 'www.innovatetech.com',
      linkedin: 'linkedin.com/company/innovatetech',
      facebook: 'facebook.com/innovatetech',
      instagram: 'instagram.com/innovatetech'
    };
  }

  // Projects
  projects = [
    {
      title: 'Dự án "Titan" - Đổi mẫu lên đám mây cho khánh hàng Fortune 500',
      date: 'Bắt đầu 2023',
      description: 'Xây dựng BMM với công cụ đỗ chuyền đó qua nhiên Serie đế'
    },
    {
      title: 'Cơ sở: Hoàn tất công cụ đền Series B',
      date: 'Gần đây 2023',
      description: 'May được BMM với công cụ đàn công cụ đề qua đến - nơi tụi thì, các thả tốt ở dạy công vọng.'
    }
  ];

  // Skills/Tags
  skills = [
    'Digital Transformation',
    'AI & Machine Learning',
    'Enterprise Software',
    'Data Analytics',
    'Cybersecurity'
  ];

  // Awards
  awards = [
    {
      title: 'Tech Innovator of the Year',
      organization: 'Global Tech Awards',
      date: 'Tháng 5, 2023'
    },
    {
      title: 'ISO/IEC 27001 Certified',
      organization: 'Recertified',
      date: '2023'
    }
  ];

  // Gallery
  gallery = [
    { type: 'image', title: 'Tất cả bài viết', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop' },
    { type: 'image', title: 'Decor', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=400&fit=crop' },
    { type: 'image', title: 'Web', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop' }
  ];

  averageRating = 5.0;
  totalReviews = 248;
  ratingDistribution = [
    { stars: 5, count: 220, percentage: 89 },
    { stars: 4, count: 20, percentage: 8 },
    { stars: 3, count: 5, percentage: 2 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 0 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.loadCompanyData();
    }
  }

  loadCompanyData(): void {
    this.isLoading = true;
    this.companyService.getCompanyById({ id: parseInt(this.companyId) }).subscribe({
      next: (response) => {
        if (response.body && response.body.responseCode === '200') {
          const data = response.body.body;
          this.company = {
            logo: data.logoUrl ? `${this.apiUrl}${data.logoUrl}` : 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&h=200&fit=crop',
            coverPhoto: data.coverPhotoUrl ? `${this.apiUrl}${data.coverPhotoUrl}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
            name: data.name || 'Company Name',
            tagline: 'We chart the future of Tech. With tech, you chart endless possibilities, breaking through barriers and creating a more positive tomorrow for all.',
            location: data.address || 'N/A',
            size: '2,500 nhân viên',
            established: '2015',
            description: data.description || 'No description available',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            address: data.address || ''
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading company data:', error);
        this.isLoading = false;
      }
    });
  }

  followCompany(): void {
    // TODO: Implement follow functionality
    console.log('Following company...');
  }

  toggleEditPopup(): void {
    this.showEditPopup = !this.showEditPopup;
  }

  goToEditCompany(): void {
    this.router.navigate(['/client/create-or-update-company', this.companyId]);
  }

  viewAllMembers(): void {
    // TODO: Navigate to team members page
    console.log('View all members');
  }

  viewAllPartners(): void {
    // TODO: Navigate to partners page
    console.log('View all partners');
  }

  writeReview(): void {
    // TODO: Open review modal
    console.log('Write a review');
  }

  viewAllReviews(): void {
    // TODO: Navigate to reviews page
    console.log('View all reviews');
  }

  viewAllGallery(): void {
    // TODO: Navigate to gallery page
    console.log('View all gallery');
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
