import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode';
import {UserProfileService} from "../../core/services/user.service";
import {ACCOUNT_TYPE, COMMON_STATUS, ROLE} from "../../pages/category/Contants";
import {MediaService} from "../../core/services/services-app/media.service";
import {ApiUrl} from "../../shared/constant/ApiUrl.constant";

@Component({
  selector: 'app-user-dialog',
  templateUrl: './users-sidebar-dialog.component.html'
})
export class UsersSidebarDialogComponent implements OnInit {

  inputData: any;   // dữ liệu truyền vào
  dataForm!: FormGroup;
  isLoading = false;
  logoUrl:any;

  labelAccountType: any = { 1: 'Admin', 2: 'User' };
  labelRole: any = { 1: 'Quản trị', 2: 'Nhân viên' };
  labelStatus: any = { 1: 'Hoạt động', 0: 'Ngưng' };


  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    public mediaService: MediaService,
    private userService:UserProfileService,
    private api: ApiUrl
  ) {}

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      username: [{ value: this.inputData?.username, disabled: true }],
      fullname: [this.inputData?.fullname, Validators.required],
      accountType: [this.inputData?.accountType, Validators.required],
      role: [this.inputData?.role, Validators.required],
      phone: [this.inputData?.phone],
      email: [this.inputData?.email, [Validators.email]],
      companyName: [this.inputData?.companyName],
      groupName: [this.inputData?.groupName],
      address: [this.inputData?.address],
      status: [this.inputData?.status],
      description: [this.inputData?.description],
      logoId:[this.inputData?.logoId],
      logoUrl:[this.inputData?.logoUrl]
    });
    if (this.inputData) {
      this.dataForm.patchValue(this.inputData);
      this.logoUrl=`${this.api.getCatalogApi()}`+this.dataForm.get("logoUrl").value;
      this.previewUrl=this.logoUrl;
    }
  }

  onSubmit() {
    debugger;
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
          this.dataForm.get('logoId').setValue(res.body.media.id);
          this.dataForm.get('logoUrl').setValue(res.body.media.url);
          this.save();
        },
        error: (err) => {
          console.error("Upload thất bại", err);
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
    this.userService.updateUser(data).subscribe({
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

