import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../../core/services/user.service';
import { MediaService } from '../../../core/services/services-app/media.service';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

interface UserData {
  id: number;
  password: string;
  fullname: string | null;
  username: string;
  address: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  description: string | null;
  createdBy: string | null;
  createdDt: string | null;
  updatedBy: string | null;
  updatedDt: string | null;
  status: string | null;
  companyId: number | null;
  groupTeamId: number | null;
  accountType: string | null;
  idCardNo: string | null;
  logoUrl: string | null;
  logoId: number | null;
  dataUsage: number | null;
  dataTotal: number | null;
  coverPhotoId: number | null;
  coverPhotoUrl: string | null;
  city: string | null;
}

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  uploadingProfile = false;
  uploadingCover = false;
  userId: number;
  userData: UserData | null = null;
  profileImageFile: File | null = null;
  coverImageFile: File | null = null;
  profileImagePreview: string | null = null;
  coverImagePreview: string | null = null;
  uploadedLogoId: number | null = null;
  uploadedLogoUrl: string | null = null;
  uploadedCoverPhotoId: number | null = null;
  uploadedCoverPhotoUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserProfileService,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getUserIdFromToken();
    this.loadUserData();
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      fullname: ['', [Validators.required]],
      username: ['', [Validators.required]],
      phone: [''],
      city: [''],
      email: ['', [Validators.email]],
      description: ['']
    });
  }

  getUserIdFromToken(): void {
    try {
      const token = localStorage.getItem('authData');
      if (token) {
        const decoded: any = jwtDecode(token);
        this.userId = decoded.userId;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể xác thực người dùng'
      });
    }
  }

  loadUserData(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getUserById({ id: this.userId }).subscribe(
      (response: any) => {
        this.loading = false;
        const data = response?.body?.body || response?.body;

        if (data) {
          this.userData = data;
          this.userForm.patchValue({
            fullname: data.fullname || '',
            username: data.username || '',
            phone: data.phone || '',
            city: data.city || '',
            email: data.email || '',
            description: data.description || ''
          });

          if (data.logoUrl) {
            this.profileImagePreview = (data.logoUrl.startsWith("/uploads") ? environment.apiUrl : "") + data.logoUrl;
            this.uploadedLogoUrl = (data.logoUrl.startsWith("/uploads") ? environment.apiUrl : "") + data.logoUrl;
          }
          if (data.logoId) {
            this.uploadedLogoId = data.logoId;
          }
          if (data.coverPhotoUrl) {
            this.coverImagePreview = (data.coverPhotoUrl.startsWith("/uploads") ? environment.apiUrl : "") + data.coverPhotoUrl;
            this.uploadedCoverPhotoUrl = (data.coverPhotoUrl.startsWith("/uploads") ? environment.apiUrl : "") + data.coverPhotoUrl;
          }
          if (data.coverPhotoId) {
            this.uploadedCoverPhotoId = data.coverPhotoId;
          }
        }
      },
      (error) => {
        this.loading = false;
        console.error('Error loading user data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải thông tin người dùng'
        });
      }
    );
  }

  onProfileImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileImageFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      this.uploadProfileImage(file);
    }
  }

  uploadProfileImage(file: File): void {
    this.uploadingProfile = true;
    const formData = new FormData();
    formData.append('file', file);

    this.mediaService.uploadMedia(formData).subscribe(
      (response: any) => {
        this.uploadingProfile = false;
        const media = response?.body?.media || response?.media;

        if (media) {
          this.uploadedLogoId = media.id;
          this.uploadedLogoUrl = media.url;

          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Tải ảnh đại diện thành công',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        this.uploadingProfile = false;
        console.error('Error uploading profile image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Tải ảnh đại diện thất bại'
        });
      }
    );
  }

  onCoverImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.coverImageFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      this.uploadCoverImage(file);
    }
  }

  uploadCoverImage(file: File): void {
    this.uploadingCover = true;
    const formData = new FormData();
    formData.append('file', file);

    this.mediaService.uploadMedia(formData).subscribe(
      (response: any) => {
        this.uploadingCover = false;
        const media = response?.body?.media || response?.media;

        if (media) {
          this.uploadedCoverPhotoId = media.id;
          this.uploadedCoverPhotoUrl = media.url;

          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Tải ảnh bìa thành công',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        this.uploadingCover = false;
        console.error('Error uploading cover image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Tải ảnh bìa thất bại'
        });
      }
    );
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    // Build complete user data object with all fields
    const updateData = {
      id: this.userId,
      password: this.userData?.password || '',
      fullname: this.userForm.value.fullname,
      username: this.userForm.value.username,
      address: this.userForm.value.description || this.userData?.address,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      role: this.userData?.role,
      description: this.userForm.value.description,
      createdBy: this.userData?.createdBy,
      createdDt: this.userData?.createdDt,
      updatedBy: this.userData?.updatedBy,
      updatedDt: this.userData?.updatedDt,
      status: this.userData?.status,
      companyId: this.userData?.companyId,
      groupTeamId: this.userData?.groupTeamId,
      accountType: this.userData?.accountType,
      idCardNo: this.userData?.idCardNo,
      logoUrl: this.uploadedLogoUrl || this.userData?.logoUrl,
      logoId: this.uploadedLogoId || this.userData?.logoId,
      dataUsage: this.userData?.dataUsage,
      dataTotal: this.userData?.dataTotal,
      coverPhotoId: this.uploadedCoverPhotoId || this.userData?.coverPhotoId,
      coverPhotoUrl: this.uploadedCoverPhotoUrl || this.userData?.coverPhotoUrl,
      city: this.userForm.value.city
    };

    this.userService.updateUser(updateData).subscribe(
      (response: any) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật thông tin thành công'
        });
      },
      (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Cập nhật thông tin thất bại'
        });
      }
    );
  }

  onCancel(): void {
    this.loadUserData();
  }
}
