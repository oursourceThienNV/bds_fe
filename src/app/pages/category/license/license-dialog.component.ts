import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import Swal from "sweetalert2";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
import {COMMON_STATUS, LICENSE_STATUS, LICENSE_TYPE, ROLE} from "../Contants";
import {LicenseService} from "../../../core/services/services-app/license.service";
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-user-dialog',
  templateUrl: './license-dialog.component.html'
})
export class LicenseDialogComponent implements OnInit {
  COMMON_STATUS = COMMON_STATUS;
  // @ts-ignore
  ROLE=ROLE;
  LICENSE_TYPE=LICENSE_TYPE;
  title: string = '';
  inputData: any;
  role:any;
  checkAction: any;
  listStore:any;
  isLoading:boolean=false;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    keyValue: [null],
    type: [null,Validators.required],
    status:[null],
    price:[null,Validators.required],
    companyId:[null,Validators.required],
  });
  constructor(public modal: NgbActiveModal,
              private translateService: TranslateService,
              private modalService: NgbModal,
              private fb: FormBuilder,private api: ApiUrl,private licenseService:LicenseService) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
    const decoded: any = jwtDecode(token || '');
    this.role=decoded.role;
    if (this.inputData) {
      console.log('inputData:', this.checkAction);
      this.dataForm.patchValue(this.inputData);
      if(this.checkAction==='S'||this.inputData.status===LICENSE_STATUS.USED){
        this.dataForm.disable();
      }
    } else {

    }
  }
  save() {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      alert("Bạn phải nhập đủ thông tin")
      return
    }
    this.isLoading=true;
    const rawValue = this.dataForm.get('price')?.value;

// Loại bỏ mọi ký tự không phải số (kể cả dấu chấm, phẩy, ₫, khoảng trắng...)
    const numericValue = Number(String(rawValue).replace(/[^\d]/g, ''));

    this.dataForm.get('price')?.setValue(numericValue);
    const data = this.dataForm.value;
    this.licenseService.insertOrUpdate(data.id, data).subscribe(res => {
      if(res.body.body===true){
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        width: '20em',
        title: data.id ? this.translateService.instant('common.message.update-success') : this.translateService.instant('common.message.insert-success'),
        showConfirmButton: false,
        timer: 2500
      });
      this.modal.close({result: 'complete'});
      this.isLoading=false;
    }else{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          width: '20em',
          title: "Đã có lỗi xảy ra vui lòng thử lại ",
          showConfirmButton: false,
          timer: 2500
        });
        this.isLoading=false;
      }
      }, (error) => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        width: '20em',
        title: error.error.message,
        showConfirmButton: false,
        timer: 2500
      });
      this.isLoading=false;
    })
  }
  formatCurrency() {
    let value = this.dataForm.get('price')?.value;
    // Xóa ký tự không phải số
    value = value.replace(/[^\d]/g, '');

    if (value) {
      // Chuyển thành định dạng có dấu phẩy ngăn cách
      const formatted = new Intl.NumberFormat('vi-VN').format(Number(value));
      this.dataForm.get('price')?.setValue(formatted, { emitEvent: false });
    }
  }
  sendCustomer(){
    const data = this.dataForm.value;
    this.licenseService.send(data.id, data).subscribe(res => {
      if(res.body.body===true){
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          width: '20em',
          title: data.id ? this.translateService.instant('common.message.update-success') : this.translateService.instant('common.message.insert-success'),
          showConfirmButton: false,
          timer: 2500
        });
        this.modal.close({result: 'complete'});
      }else{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          width: '20em',
          title: "Đã có lỗi xảy ra vui lòng thử lại ",
          showConfirmButton: false,
          timer: 2500
        });
      }
    }, (error) => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        width: '20em',
        title: error.error.message,
        showConfirmButton: false,
        timer: 2500
      });
    })
  }
  onBlurFormatCurrency() {
    this.formatCurrency();
  }

  LICENSE_STATUS = LICENSE_STATUS;
}

