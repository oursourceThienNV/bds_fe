import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { CompanyService } from 'src/app/core/services/services-app/company.service';
import {COMMON_STATUS, ROLE} from '../Contants';
import { MediaDialogComponent } from '../image/media-dialog.component';
import { ApiUrl } from 'src/app/shared/constant/ApiUrl.constant';
import { UserProfileService } from 'src/app/core/services/user.service';
import {MediaService} from "../../../core/services/services-app/media.service";
import {jwtDecode} from "jwt-decode";


@Component({
  selector: 'app-company-dialog',
  templateUrl: './company-dialog.component.html'
})
export class CompanyDialogComponent implements OnInit {
  COMMON_STATUS = COMMON_STATUS;
  ROLE=ROLE;
  title: string = 'Thêm/Cập nhật công ty';
  inputData: any;
  isLoading: boolean = false;
  listUser:any;
 role:any;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    name: [null, Validators.required],
    email: [null, Validators.required],
    phone: [null, Validators.required],
    address: [null, Validators.required],
    tax: [null, Validators.required],
    website: [null],
    logoUrl: [null],
    logoId:[null],
    description: [null],
    status: [COMMON_STATUS.ACTIVE, Validators.required],
    dataTotal:[null],
  });

  constructor(
    public modal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private api: ApiUrl,
    private modalService: NgbModal,
    public mediaService: MediaService,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
    if (token) {
      const decoded: any = jwtDecode(token); // ✅ không cần token || ''
      this.role = decoded.role;
    }
    if (this.inputData) {
      this.dataForm.patchValue(this.inputData);
      this.logoUrl=`${this.api.getCatalogApi()}`+this.dataForm.get("logoUrl").value;
      this.previewUrl=this.logoUrl;
    }
  }
  submit() {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('type', '1'); // Giá trị ví dụ
    formData.append('typeId', '123'); // Giá trị ví dụ
    if (this.selectedFile==null){
      if(this.previewUrl==null) {
        this.dataForm.get('logoId').setValue(null);
        this.dataForm.get('logoUrl').setValue(null);
      }
      this.save();
    }else {
      this.mediaService.uploadMedia(formData).subscribe({
        next: (res) => {
          const media = res?.body?.media;
          if (!media || !media.id || !media.url) {
            this.showError('Upload ảnh thất bại. Vui lòng thử lại.');
            return;
          }
          this.dataForm.get('logoId').setValue(media.id);
          this.dataForm.get('logoUrl').setValue(media.url);
          this.save();
        },
        error: (err) => {
          console.error("Upload thất bại", err);
          this.showError('Upload ảnh thất bại. Vui lòng thử lại.');
        }
      });
    }
  }
  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data = this.dataForm.value;
    this.companyService.insertOrUpdate(data).subscribe({
      next: (res) => {
        if (res.body?.body === true) {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: this.inputData ? 'Cập nhật thành công' : 'Thêm mới thành công',
            showConfirmButton: false,
            timer: 2000
          });
          this.modal.close({ result: 'complete' });
        } else {
          this.showError('Đã có lỗi xảy ra, vui lòng thử lại');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(err?.error?.message || 'Lỗi hệ thống');
        this.isLoading = false;
      }
    });
  }

  private showError(message: string): void {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2500
    });
  }
    logoUrl: string | null = null;
  // uploadfile() {
  //   this.isLoading = true;
  //   const res = this.modalService.open(MediaDialogComponent, { size: 'lg', centered: true });
  //   res.result.then(
  //     (result) => {
  //       console.log("Kết quả từ modal:", result);
  //       const url = `${this.api.getCatalogApi()}${result.body.media.url}`;
  //         this.dataForm.get("logoUrl").setValue(result.body.media.url);
  //         this.dataForm.get("logoId").setValue(result.body.media.id);
  //         this.logoUrl = url;
  //       this.isLoading = false;
  //     },
  //     (reason) => {
  //       this.isLoading = false;
  //       console.log("Modal bị đóng:", reason);
  //     }
  //   );
  // }
  // removeImage() {
  //     this.logoUrl = null;
  //     this.dataForm.get("logoUrl").setValue(null);
  //     this.dataForm.get("logoId").setValue(null);
  // }
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
      this.selectedFile = null;
    }
  }

}
