import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PostService } from '../../core/services/services-app/post.service';
import { UserProfileService } from '../../core/services/user.service';
import { CommonCodeServices } from '../../core/services/services-app/common-code.service';
import { LocationServices } from '../../core/services/services-app/location.service';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

interface Post {
  id: number;
  idTaiKhoan: number;
  loaiBanTin: string;
  noiDung: string;
  createDt: string;
  status: string;
  countLike: number;
  countComment: number;
  author?: {
    fullname: string;
    logoUrl: string;
    username: string;
  };
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'blockQuote', 'undo', 'redo']
  };
  newPostContent: string = '';
  isEditorFocused: boolean = false;
  authData: any = null;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  posts: Post[] = [];
  domain: string = environment.apiUrl;

  // Comment tracking
  showCommentInput: { [postId: number]: boolean } = {};
  commentTexts: { [postId: number]: string } = {};
  postComments: { [postId: number]: any[] } = {};
  loadingComments: { [postId: number]: boolean } = {};

  // Filters
  selectedNganhNghe: string = '';
  selectedDiaDiem: string = '';
  selectedSoChiNhanh: string = '';
  selectedGiaRange: string = '';
  selectedTiLeRange: string = '';

  nganhNgheOptions: any[] = [];
  diaDiemOptions: any[] = [];
  soChiNhanhOptions: string[] = ['1-5', '6-10', '11-20', '20+'];
  giaRangeOptions: any[] = [
    { label: 'Dưới 100 triệu', min: 0, max: 100000000 },
    { label: '100-500 triệu', min: 100000000, max: 500000000 },
    { label: '500 triệu - 1 tỷ', min: 500000000, max: 1000000000 },
    { label: 'Trên 1 tỷ', min: 1000000000, max: null }
  ];
  tiLeRangeOptions: any[] = [
    { label: 'Dưới 20%', min: 0, max: 20 },
    { label: '20-40%', min: 20, max: 40 },
    { label: '40-60%', min: 40, max: 60 },
    { label: 'Trên 60%', min: 60, max: null }
  ];

  constructor(
    private postService: PostService,
    private userProfileService: UserProfileService,
    private commonCodeServices: CommonCodeServices,
    private locationServices: LocationServices,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get authentication data from localStorage
    const authDataStr = localStorage.getItem('authData');
    if (authDataStr) {
      try {
        this.authData = jwtDecode(authDataStr);
      } catch (e) {
        console.error('Error parsing authData:', e);
      }
    }
    this.loadFilterOptions();
    this.loadPosts();
  }

  loadFilterOptions(): void {
    // Load Ngành nghề from CommonCodeServices
    this.commonCodeServices.listAllByType({ type: 'NN' }).subscribe(
      (response) => {
        if (response.body && response.body.body) {
          this.nganhNgheOptions = response.body.body.map((item: any) => ({
            code: item.code,
            name: item.name
          }));
        }
      },
      (error) => {
        console.error('Error loading ngành nghề:', error);
      }
    );

    // Load Địa điểm from LocationServices
    this.locationServices.listProvince().subscribe(
      (response) => {
        if (response.body ) {
          this.diaDiemOptions = response.body.map((item: any) => ({
            code: item.code,
            name: item.name
          }));
          console.log('Địa điểm options:', this.diaDiemOptions);
        }
      },
      (error) => {
        console.error('Error loading địa điểm:', error);
      }
    );
  }

  loadPosts(): void {
    const body: any = {
      "status": ["marketplace"],
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    // Add filters if selected
    if (this.selectedNganhNghe) {
      body.nganhNghe = { "contains": this.selectedNganhNghe };
    }
    if (this.selectedDiaDiem) {
      body.diaDiem = { "contains": this.selectedDiaDiem };
    }
    if (this.selectedSoChiNhanh) {
      body.soChiNhanh = { "contains": this.selectedSoChiNhanh };
    }
    if (this.selectedGiaRange) {
      const giaRange = this.giaRangeOptions.find(opt => opt.label === this.selectedGiaRange);
      if (giaRange) {
        body.giaBatDau = { "greaterThanOrEqual": giaRange.min };
        if (giaRange.max) {
          body.giaKetThuc = { "lessThanOrEqual": giaRange.max };
        }
      }
    }
    if (this.selectedTiLeRange) {
      const tiLeRange = this.tiLeRangeOptions.find(opt => opt.label === this.selectedTiLeRange);
      if (tiLeRange) {
        body.tiLeBatDau = { "greaterThanOrEqual": tiLeRange.min };
        if (tiLeRange.max) {
          body.tiLeBatKetThuc = { "lessThanOrEqual": tiLeRange.max };
        }
      }
    }
    this.postService.search(body).subscribe(
      (response) => {
        if (response.body && response.body.body && response.body.body.page) {
          const pageData = response.body.body.page;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.currentPage;
          this.totalElements = pageData.totalElements;
          this.pageSize = pageData.pageSize;

          const posts = pageData.content || [];

          // Fetch user data for each post
          if (posts.length > 0) {
            const userRequests = posts.map((post: any) =>
              this.userProfileService.getUserById({ id: post.idTaiKhoan })
            );

            forkJoin(userRequests).subscribe(
              (userResponses: any[]) => {
                this.posts = posts.map((post: any, index: number) => {
                  const userData = userResponses[index]?.body?.body;
                  return {
                    ...post,
                    author: userData ? {
                      fullname: userData.fullname,
                      logoUrl: userData.logoUrl,
                      username: userData.username
                    } : null
                  };
                });
              },
              (error) => {
                console.error('Error loading user data:', error);
                this.posts = posts;
              }
            );
          } else {
            this.posts = [];
          }
        }
      },
      (error) => {
        console.error('Error loading posts:', error);
      }
    );
  }

  createPost(): void {
    if (!this.newPostContent || this.newPostContent.trim() === '') {
      this.toastr.warning('Vui lòng nhập nội dung bài viết', 'Thông báo');
      return;
    }

    if (!this.authData || !this.authData.userId) {
      this.toastr.error('Vui lòng đăng nhập để đăng bài', 'Lỗi');
      return;
    }

    const body = {
      idTaiKhoan: this.authData.userId,
      loaiTaiKhoan: 'CN',
      noiDung: this.newPostContent,
      status: 'marketplace',
      loaiBanTin: "fast"
    };

    this.postService.insertOrUpdate(body).subscribe(
      (response) => {
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đăng bài thành công',
            timer: 2000,
            showConfirmButton: false
          });
          this.newPostContent = '';
          this.isEditorFocused = false;
          this.currentPage = 0; // Reset to first page
          this.loadPosts();
        }
      },
      (error) => {
        console.error('Error creating post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi đăng bài'
        });
      }
    );
  }

  onEditorFocus(): void {
    this.isEditorFocused = true;
  }

  onEditorBlur(): void {
    // Keep editor expanded if there's content
    if (!this.newPostContent || this.newPostContent.trim() === '') {
      this.isEditorFocused = false;
    }
  }

  getAvatarUrl(logoUrl: string): string {
    if (!logoUrl) {
      return 'https://ui-avatars.com/api/?name=User&background=6c757d&color=fff';
    }
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }
    return `${this.domain}${logoUrl}`;
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${this.domain}${imageUrl}`;
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return postDate.toLocaleDateString('vi-VN');
    }
  }

  likePost(post: Post): void {
    console.log('Like post:', post.id);
  }

  sharePost(post: Post): void {
    console.log('Share post:', post.id);
  }

  savePost(post: Post): void {
    console.log('Save post:', post.id);
  }

  viewPostDetail(post: Post): void {
    this.router.navigate(['/client/post', post.id]);
  }

  toggleCommentInput(post: Post): void {
    this.showCommentInput[post.id] = !this.showCommentInput[post.id];
    if (!this.showCommentInput[post.id]) {
      this.commentTexts[post.id] = '';
    } else {
      // Load comments when opening comment section
      this.loadComments(post);
    }
  }

  loadComments(post: Post): void {
    if (this.loadingComments[post.id]) return;

    this.loadingComments[post.id] = true;
    const body = { postId: post.id };

    this.postService.listComment(body).subscribe(
      (response) => {
        if (response.body && response.body.body) {
          this.postComments[post.id] = response.body.body;
        } else {
          this.postComments[post.id] = [];
        }
        this.loadingComments[post.id] = false;
      },
      (error) => {
        console.error('Error loading comments:', error);
        this.postComments[post.id] = [];
        this.loadingComments[post.id] = false;
      }
    );
  }

  submitComment(post: Post): void {
    const commentText = this.commentTexts[post.id]?.trim();

    if (!commentText) {
      this.toastr.warning('Vui lòng nhập nội dung bình luận', 'Thông báo');
      return;
    }

    if (!this.authData || !this.authData.userId) {
      this.toastr.error('Vui lòng đăng nhập để bình luận', 'Lỗi');
      return;
    }

    const body = {
      userId: this.authData.userId,
      type: 'CN',
      content: commentText,
      postId: post.id,
      userCreate: this.authData.userId
    };

    this.postService.createComment(body).subscribe(
      (response) => {
        if (response.status === 200) {
          this.toastr.success('Bình luận thành công', 'Thành công');
          this.commentTexts[post.id] = '';
          // Increment comment count
          post.countComment = (post.countComment || 0) + 1;
          // Reload comments to show the new one
          this.loadComments(post);
        }
      },
      (error) => {
        console.error('Error creating comment:', error);
        this.toastr.error('Có lỗi xảy ra khi bình luận', 'Lỗi');
      }
    );
  }

  // Filter methods
  onFilterChange(): void {
    this.currentPage = 0; // Reset to first page when filter changes
    this.loadPosts();
  }

  resetFilters(): void {
    this.selectedNganhNghe = '';
    this.selectedDiaDiem = '';
    this.selectedSoChiNhanh = '';
    this.selectedGiaRange = '';
    this.selectedTiLeRange = '';
    this.currentPage = 0;
    this.loadPosts();
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage < 3) {
        for (let i = 0; i < 3; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages - 1);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(0);
        pages.push(-1); // Ellipsis
        for (let i = this.totalPages - 3; i < this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push(-1); // Ellipsis
        pages.push(this.currentPage);
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages - 1);
      }
    }

    return pages;
  }
}
