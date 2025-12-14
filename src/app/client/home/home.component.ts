import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PostService } from '../../core/services/services-app/post.service';
import { UserProfileService } from '../../core/services/user.service';
import { MediaService } from '../../core/services/services-app/media.service';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { UploadAdapterPlugin } from '../../core/utils/ckeditor-upload-adapter';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public Editor = ClassicEditor;
  public editorConfig: any = {
    toolbar: [
      'heading', '|',
      'bold', 'italic', 'link', '|',
      'bulletedList', 'numberedList', '|',
      'imageUpload', 'blockQuote', '|',
      'undo', 'redo'
    ],
    image: {
      toolbar: [
        'imageTextAlternative', '|',
        'imageStyle:alignLeft',
        'imageStyle:full',
        'imageStyle:alignRight'
      ],
      styles: [
        'full',
        'alignLeft',
        'alignRight'
      ]
    }
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

  constructor(
    private postService: PostService,
    private userProfileService: UserProfileService,
    private mediaService: MediaService,
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
    this.loadPosts();
  }

  onReady(editor: any): void {
    UploadAdapterPlugin(editor, this.mediaService);
  }

  loadPosts(): void {
    const body = {
      status: ["home", "both"],
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
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
      status: 'home',
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
