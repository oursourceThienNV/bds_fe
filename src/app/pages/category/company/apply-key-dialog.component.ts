import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as moment from "moment";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import Swal from "sweetalert2";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
import {CompanyService} from "../../../core/services/services-app/company.service";
@Component({
  selector: 'app-user-dialog',
  templateUrl: './apply-key-dialog.component.html'
})
export class ApplyKeyDialogComponent implements OnInit {
  title: string = '';
  inputData: any;
  role:any;
  checkAction: any;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    code: [null],
    name: [null],
    license:[null]
  });
  isLoading: boolean = false;
  constructor(public modal: NgbActiveModal,
              private translateService: TranslateService,
              private fb: FormBuilder,private api: ApiUrl,private companyService:CompanyService) {
  }

  ngOnInit(): void {

    if (this.inputData) {
      this.dataForm.patchValue(this.inputData);
      this.role=this.dataForm.get("role").value;
    } else {

    }
  }
  save() {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return
    }
    this.isLoading = true;
    const data = this.dataForm.value;
    this.companyService.applyKey(data.id, data).subscribe(res => {
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
        this.isLoading = false;
      }else{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          width: '20em',
          title: "Đã có lỗi xảy ra vui lòng thử lại ",
          showConfirmButton: false,
          timer: 2500
        });
        this.isLoading = false;
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
      this.isLoading = false;
    })
  }
  u

}

