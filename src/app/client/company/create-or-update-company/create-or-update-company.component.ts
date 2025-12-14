import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../core/services/services-app/company.service';
import { MediaService } from '../../../core/services/services-app/media.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-or-update-company',
  templateUrl: './create-or-update-company.component.html',
  styleUrls: ['./create-or-update-company.component.scss']
})
export class CreateOrUpdateCompanyComponent implements OnInit {
  companyForm: FormGroup;
  loading = false;
  uploadingLogo = false;
  uploadingCover = false;
  logoPreview: string | null = null;
  coverPreview: string | null = null;
  logoId: number | null = null;
  logoUrl: string | null = null;
  coverPhotoId: number | null = null;
  coverPhotoUrl: string | null = null;
  companyId: number | null = null;
  isEditMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkRouteParams();
  }

  checkRouteParams(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.companyId = +params['id'];
        this.isEditMode = true;
        this.loadCompanyData();
      }
    });
  }

  loadCompanyData(): void {
    if (!this.companyId) return;

    this.loading = true;
    this.companyService.getCompanyById({ id: this.companyId }).subscribe(
      (response: any) => {
        this.loading = false;
        const company = response?.body?.body;

        if (company) {
          // Populate form with company data
          this.companyForm.patchValue({
            companyName: company.name,
            slogan: company.description,
            address: company.address,
            phoneNumber: company.phone,
            email: company.email,
            introduction: company.description
          });

          // Set logo data
          if (company.logoUrl) {
            this.logoId = company.logoId;
            this.logoUrl = environment.apiUrl + company.logoUrl;
            this.logoPreview = environment.apiUrl + company.logoUrl;
          }

          // Set cover photo data
          if (company.coverPhotoUrl) {
            this.coverPhotoId = company.coverPhotoId;
            this.coverPhotoUrl = environment.apiUrl + company.coverPhotoUrl;
            this.coverPreview = environment.apiUrl + company.coverPhotoUrl;
          }
        }
      },
      (error) => {
        this.loading = false;
        console.error('Error loading company:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải thông tin công ty'
        });
      }
    );
  }

  initForm(): void {
    this.companyForm = this.formBuilder.group({
      companyName: ['', [Validators.required]],
      industry: ['Công ty / TNHH / ABC', [Validators.required]],
      slogan: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      introduction: ['']
    });
  }

  onLogoSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      this.uploadLogo(file);
    }
  }

  uploadLogo(file: File): void {
    this.uploadingLogo = true;
    const formData = new FormData();
    formData.append('file', file);

    this.mediaService.uploadMedia(formData).subscribe(
      (response: any) => {
        this.uploadingLogo = false;
        const media = response?.body?.media || response?.media;

        if (media) {
          this.logoId = media.id;
          this.logoUrl = media.url;

          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Tải logo thành công',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      (error) => {
        this.uploadingLogo = false;
        console.error('Error uploading logo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Tải logo thất bại'
        });
      }
    );
  }

  onCoverSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      this.uploadCover(file);
    }
  }

  uploadCover(file: File): void {
    this.uploadingCover = true;
    const formData = new FormData();
    formData.append('file', file);

    this.mediaService.uploadMedia(formData).subscribe(
      (response: any) => {
        this.uploadingCover = false;
        const media = response?.body?.media || response?.media;

        if (media) {
          this.coverPhotoId = media.id;
          this.coverPhotoUrl = media.url;

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
        console.error('Error uploading cover:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Tải ảnh bìa thất bại'
        });
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/client/home']);
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      Object.keys(this.companyForm.controls).forEach(key => {
        this.companyForm.get(key)?.markAsTouched();
      });

      Swal.fire({
        icon: 'warning',
        title: 'Thông tin chưa đầy đủ',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    this.loading = true;

    const companyData = {
      id: this.companyId, // null for create, set value for update
      name: this.companyForm.value.companyName,
      email: this.companyForm.value.email,
      phone: this.companyForm.value.phoneNumber,
      address: this.companyForm.value.address,
      tax: null,
      website: null,
      logoUrl: this.logoUrl,
      logoId: this.logoId,
      description: this.companyForm.value.introduction,
      status: '01', // Active status
      createdAt: null,
      updatedAt: null,
      expriedTime: null,
      license: null,
      dataUsage: null,
      dataTotal: null,
      coverPhotoId: this.coverPhotoId,
      coverPhotoUrl: this.coverPhotoUrl
    };

    this.companyService.insertOrUpdate(companyData).subscribe(
      (response: any) => {
        this.loading = false;
        const message = this.isEditMode ? 'Cập nhật trang công ty thành công' : 'Tạo trang công ty thành công';
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: message
        }).then(() => {
          this.router.navigate(['/client/home']);
        });
      },
      (error) => {
        this.loading = false;
        console.error('Error creating/updating company:', error);
        const message = this.isEditMode ? 'Cập nhật trang công ty thất bại' : 'Tạo trang công ty thất bại';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: message
        });
      }
    );
  }
}
