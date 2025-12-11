import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../core/services/services-app/post.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  postId: number;
  postData: any;
  loading = true;

  // Parsed data for display
  images: string[] = [];
  mainImage: string = '';
  quyTrinhNhuongQuyen: string[] = [];
  hoTroThuongHieu: string[] = [];
  cauHoiThuongGap: any[] = [];
  expandedFaqIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.postId = params['id'] || 11; // Use 11 for testing if no id provided
      this.loadPostDetail();
    });
  }

  loadPostDetail(): void {
    this.loading = true;
    const body = { id: this.postId };

    this.postService.detail(body).subscribe(
      response => {
        if (response.body && response.body.body) {
          this.postData = response.body.body;
          this.parsePostData();
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading post detail:', error);
        this.loading = false;
      }
    );
  }

  parsePostData(): void {
    if (!this.postData) return;

    // Parse main image
    this.mainImage = this.postData.anhDaiDien || '';

    // Parse additional images
    try {
      if (this.postData.dsAnhPhu) {
        this.images = JSON.parse(this.postData.dsAnhPhu);
      }
    } catch (e) {
      console.error('Error parsing images:', e);
      this.images = [];
    }

    // Parse quy trình nhượng quyền
    try {
      if (this.postData.quyTrinhNhuongQuyen) {
        this.quyTrinhNhuongQuyen = JSON.parse(this.postData.quyTrinhNhuongQuyen);
      }
    } catch (e) {
      console.error('Error parsing quyTrinhNhuongQuyen:', e);
      this.quyTrinhNhuongQuyen = [];
    }

    // Parse hỗ trợ thương hiệu
    try {
      if (this.postData.hoTroThuongHieu) {
        this.hoTroThuongHieu = JSON.parse(this.postData.hoTroThuongHieu);
      }
    } catch (e) {
      console.error('Error parsing hoTroThuongHieu:', e);
      this.hoTroThuongHieu = [];
    }

    // Parse câu hỏi thường gặp
    try {
      if (this.postData.cauHoiThuongGap) {
        this.cauHoiThuongGap = JSON.parse(this.postData.cauHoiThuongGap);
      }
    } catch (e) {
      console.error('Error parsing cauHoiThuongGap:', e);
      this.cauHoiThuongGap = [];
    }
  }

  goBack(): void {
    this.router.navigate(['/client/home']);
  }

  formatCurrency(value: number): string {
    if (!value) return '0 đ';
    return value.toLocaleString('vi-VN') + ' đ';
  }

  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    // If path already includes domain, return as is
    if (path.startsWith('http')) return path;
    // Otherwise, construct full URL (adjust base URL as needed)
    return `http://160.22.123.39:8084${path}`;
  }
}
