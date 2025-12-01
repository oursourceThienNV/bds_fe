import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import {UserProfileService} from "../../../../core/services/user.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  title: string = '';
  inputData: any;

  showPassword = false;
  showRePassword = false;

  dataForm: FormGroup = this.fb.group({
    id: [null],
    username: [null, [Validators.required, Validators.maxLength(50)]],
    password: [null,[Validators.required, Validators.maxLength(50)]],
    rePassword:[null,[Validators.required, Validators.maxLength(50)]]
  });
  constructor(public modal: NgbActiveModal,
              private translateService: TranslateService,
              public userProfileService: UserProfileService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    if(this.inputData) {
      this.dataForm.get('username').patchValue(this.inputData.username);
    }
  }

  save() {
    debugger;
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return
    }
    const data = this.dataForm.value;
    this.userProfileService.changePassword(data).subscribe(res => {
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
  enterPassword() {
    if (this.password.valid && this.rePassword.valid) {
      if (this.password.value !== this.rePassword.value) {
        this.password.setErrors({passwordNotMatch: true});
        alert("Mật khẩu và nhập lại mật khẩu không khớp");
      } else if(this.password.valid && this.rePassword.valid){
        this.password.setErrors(null);
        this.rePassword.setErrors(null);
        alert("Mật khẩu và nhập lại mật khẩu không khớp");
      }
    }
  }

  enterRePassword() {
    if (this.password.value && this.rePassword.value) {
      if (this.password.value !== this.rePassword.value) {
        this.rePassword.setErrors({passwordNotMatch: true});
        alert("Mật khẩu và nhập lại mật khẩu không khớp");
      } else {
        this.password.setErrors(null);
        this.rePassword.setErrors(null);
      }
    }
  }

  get password() {
    return this.dataForm.get('password');
  }

  get rePassword() {
    return this.dataForm.get('rePassword');
  }

}
