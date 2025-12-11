import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonCodeServices } from '../../core/services/services-app/common-code.service';
import { LocationServices } from '../../core/services/services-app/location.service';
import { MediaService } from '../../core/services/services-app/media.service';
import { PostService } from '../../core/services/services-app/post.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-franchise',
  templateUrl: './franchise.component.html',
  styleUrls: ['./franchise.component.scss']
})
export class FranchiseComponent implements OnInit {
  franchiseForm: FormGroup;
  loading = false;
  industries: any[] = [];
  provinces: any[] = [];
  currentStep = 1;

  // CKEditor configuration
  public Editor = ClassicEditor;
  public editorConfig = {
    placeholder: 'Mô tả giới thiệu về chuỗi (5-10 dòng)',
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'link',
        'blockQuote',
        '|',
        'undo',
        'redo'
      ]
    }
  };

  // Image upload properties
  representativeImage: any = null;
  representativeImagePreview: string | null = null;
  otherImages: any[] = [];
  uploadingRepresentative = false;
  uploadingOther = false;

  // Form arrays for dynamic fields
  franchiseSteps: any[] = [{ description: '' }];
  supportItems: any[] = [{ description: '' }];
  faqs: any[] = [{ question: '', answer: '' }];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private commonCodeService: CommonCodeServices,
    private locationService: LocationServices,
    private mediaService: MediaService,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadIndustries();
    this.loadProvinces();
  }

  initForm(): void {
    this.franchiseForm = this.formBuilder.group({
      // I. Thông tin thương hiệu
      tenThuongHieu: ['', [Validators.required]],
      nganhNghe: [''],

      // II. Thông tin bài đăng
      tieuDe: ['', [Validators.required]],
      tieuDePhu: [''],

      // III. Hình ảnh dự án
      anhDaiDien: [null],
      dsAnhPhu: [null],

      // IV. Thông tin tài chính
      giaNhuongQuyen: ['', [Validators.required]],
      soChiNhanh: [''],
      tiLeLoiNhuan: [''],
      thoiGianHoanVon: [''],

      // V. Thông tin mô hình
      dienTichYeuCau: [''],
      soLuongNhanSu: [''],
      diaDiemMongMuon: [''],
      truSoChinh: [''],

      // VI. Mô tả chi tiết
      noiDung: ['']
    });
  }

  loadIndustries(): void {
    this.commonCodeService.listAllByType({ type: 'NN' }).subscribe(
      (response: any) => {
        this.industries = response?.body?.body || [];
      },
      (error) => {
        console.error('Error loading industries:', error);
      }
    );
  }

  loadProvinces(): void {
    this.locationService.listProvince().subscribe(
      (response: any) => {
        this.provinces = response?.body || [];
        console.log('Provinces loaded:', this.provinces);
      },
      (error) => {
        console.error('Error loading provinces:', error);
      }
    );
  }

  // Dynamic array management
  addFranchiseStep(): void {
    this.franchiseSteps.push({ description: '' });
  }

  removeFranchiseStep(index: number): void {
    if (this.franchiseSteps.length > 1) {
      this.franchiseSteps.splice(index, 1);
    }
  }

  addSupportItem(): void {
    this.supportItems.push({ description: '' });
  }

  removeSupportItem(index: number): void {
    if (this.supportItems.length > 1) {
      this.supportItems.splice(index, 1);
    }
  }

  addFaq(): void {
    this.faqs.push({ question: '', answer: '' });
  }

  removeFaq(index: number): void {
    if (this.faqs.length > 1) {
      this.faqs.splice(index, 1);
    }
  }

  onRepresentativeImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Vui lòng chọn file ảnh'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Kích thước ảnh không được vượt quá 5MB'
        });
        return;
      }

      this.uploadingRepresentative = true;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.representativeImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      this.mediaService.uploadMedia(formData).subscribe(
        (response: any) => {
          this.uploadingRepresentative = false;
          if (response.responseCode === '00' && response.body?.media) {
            this.representativeImage = response.body.media;
            this.franchiseForm.patchValue({ anhDaiDien: response.body.media.url });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: response.responseMessage || 'Upload ảnh thất bại'
            });
            this.representativeImagePreview = null;
          }
        },
        (error) => {
          this.uploadingRepresentative = false;
          this.representativeImagePreview = null;
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Upload ảnh thất bại. Vui lòng thử lại'
          });
          console.error('Upload error:', error);
        }
      );
    }
  }

  removeRepresentativeImage(): void {
    this.representativeImage = null;
    this.representativeImagePreview = null;
    this.franchiseForm.patchValue({ anhDaiDien: null });
  }

  onOtherImagesSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate number of files
      if (this.otherImages.length + files.length > 10) {
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: 'Chỉ được upload tối đa 10 ảnh phụ'
        });
        return;
      }

      this.uploadingOther = true;
      let uploadedCount = 0;
      const totalFiles = files.length;

      Array.from(files).forEach((file: any) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          uploadedCount++;
          if (uploadedCount === totalFiles) {
            this.uploadingOther = false;
          }
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          uploadedCount++;
          if (uploadedCount === totalFiles) {
            this.uploadingOther = false;
          }
          return;
        }

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);

        this.mediaService.uploadMedia(formData).subscribe(
          (response: any) => {
            uploadedCount++;
            if (response.responseCode === '00' && response.body?.media) {
              const media = response.body.media;
              // Create preview
              const reader = new FileReader();
              reader.onload = (e: any) => {
                this.otherImages.push({
                  ...media,
                  preview: e.target.result
                });
              };
              reader.readAsDataURL(file);
            }

            if (uploadedCount === totalFiles) {
              this.uploadingOther = false;
            }
          },
          (error) => {
            uploadedCount++;
            console.error('Upload error:', error);
            if (uploadedCount === totalFiles) {
              this.uploadingOther = false;
            }
          }
        );
      });

      // Reset input
      event.target.value = '';
    }
  }

  removeOtherImage(index: number): void {
    this.otherImages.splice(index, 1);
  }

  onCancel(): void {
    this.router.navigate(['/client/home']);
  }

  onSaveDraft(): void {
    if (this.franchiseForm.invalid) {
      Object.keys(this.franchiseForm.controls).forEach(key => {
        this.franchiseForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    this.loading = true;
    const franchiseData = this.buildFranchiseData('both');

    this.postService.insertOrUpdate(franchiseData).subscribe(
      (response: any) => {
        this.loading = false;
        if (response?.body?.responseCode === '00' || response?.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đăng tin tại trang chủ và marketplace thành công'
          }).then(() => {
            this.router.navigate(['/client/home']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: response?.body?.responseMessage || 'Đăng tin thất bại'
          });
        }
      },
      (error) => {
        this.loading = false;
        console.error('Post error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Đăng tin thất bại. Vui lòng thử lại'
        });
      }
    );
  }

  buildFranchiseData(status: string): any {
    return {
      loaiTaiKhoan: 'CN',
      loaiBanTin: 'franchise',
      tenThuongHieu: this.franchiseForm.value.tenThuongHieu,
      nganhNghe: this.franchiseForm.value.nganhNghe,
      tieuDe: this.franchiseForm.value.tieuDe,
      tieuDePhu: this.franchiseForm.value.tieuDePhu,
      anhDaiDien: this.representativeImage?.url || null,
      dsAnhPhu: JSON.stringify(this.otherImages.map(img => img.url)),
      giaNhuongQuyen: this.franchiseForm.value.giaNhuongQuyen,
      soChiNhanh: this.franchiseForm.value.soChiNhanh,
      tiLeLoiNhuan: this.franchiseForm.value.tiLeLoiNhuan,
      thoiGianHoanVon: this.franchiseForm.value.thoiGianHoanVon,
      dienTichYeuCau: this.franchiseForm.value.dienTichYeuCau,
      soLuongNhanSu: this.franchiseForm.value.soLuongNhanSu,
      diaDiemMongMuon: this.franchiseForm.value.diaDiemMongMuon,
      truSoChinh: this.franchiseForm.value.truSoChinh,
      noiDung: this.franchiseForm.value.noiDung,
      quyTrinhNhuongQuyen: JSON.stringify(this.franchiseSteps.map(s => s.description).filter(d => d)),
      hoTroThuongHieu: JSON.stringify(this.supportItems.map(s => s.description).filter(d => d)),
      cauHoiThuongGap: JSON.stringify(this.faqs.filter(f => f.question || f.answer)),
      status: status
    };
  }

  onSubmit(): void {
    if (this.franchiseForm.invalid) {
      Object.keys(this.franchiseForm.controls).forEach(key => {
        this.franchiseForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    this.loading = true;
    const franchiseData = this.buildFranchiseData('marketplace');

    console.log('Franchise data:', franchiseData);

    this.postService.insertOrUpdate(franchiseData).subscribe(
      (response: any) => {
        this.loading = false;
        if (response?.body?.responseCode === '00' || response?.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đăng tin nhượng quyền thành công'
          }).then(() => {
            this.router.navigate(['/client/home']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: response?.body?.responseMessage || 'Đăng tin thất bại'
          });
        }
      },
      (error) => {
        this.loading = false;
        console.error('Post error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Đăng tin thất bại. Vui lòng thử lại'
        });
      }
    );
  }
}
