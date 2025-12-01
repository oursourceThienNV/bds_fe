import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {ACCOUNT_TYPE, COMMMON_CODE, ROLE} from '../Contants';
import { jwtDecode } from 'jwt-decode';
import {CommonCodeServices} from "../../../core/services/services-app/common-code.service";
@Component({
  selector: 'app-group-dialog',
  templateUrl: './common-code-dialog.component.html'
})
export class CommonCodeDialogComponent implements OnInit {
  title: string = 'Thêm/Cập nhật công ty';
  inputData: any;
  isLoading: boolean = false;
  role:any;
  type:any;
  COMMMON_CODE = COMMMON_CODE;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    code:[null],
    name: [null, Validators.required],
    workSpaceId:[],
    type:[],
    description:[]
  });
  accountType:any;
  constructor(
    public modal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private commonCodeServices: CommonCodeServices,
  ) {}

  get typeLabel(): string {
    const v = this.dataForm.get('type')?.value;
    if (v === COMMMON_CODE.NHOM_KH)  return 'Nhóm khách hàng';
    if (v === COMMMON_CODE.LINHVUC)  return 'Lĩnh vực';
    if (v === COMMMON_CODE.SOURCE)   return 'Nguồn';
    if (v === COMMMON_CODE.CHANNEL)  return 'Kênh liên hệ';
    if (v === COMMMON_CODE.TTMH)     return 'Trạng thái mua hàng';
    if (v === COMMMON_CODE.TTCSKH)   return 'Trạng thái chăm sóc khách hàng';
    return '';
  }
  ngOnInit(): void {
    debugger;
    const authWs = localStorage.getItem('authWs');
    if(authWs) {
      const decoded: any = jwtDecode(authWs);
      const workSpaceId = decoded.workSpaceId
      this.dataForm.get("workSpaceId").setValue(workSpaceId);
      this.dataForm.get('type').setValue(this.type);
    }
    if(this.inputData){
      this.dataForm.patchValue(this.inputData);
    }
  }
  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data = this.dataForm.value;
    this.commonCodeServices.insertOrUpdate(data).subscribe({
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

}
