import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import * as moment from "moment";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import Swal from "sweetalert2";
import {buildUnitTree} from "../../../../core/utils/common";
import {UserProfileService} from "../../../../core/services/user.service";
import {ACCOUNT_TYPE, COMMON_STATUS, ROLE} from "../../Contants";
import { jwtDecode } from 'jwt-decode';
import { GroupTeamService } from 'src/app/core/services/services-app/group-team.service';
import { log } from 'console';
interface Pharse{
  stt:number;
  id:number,
  code:string,
  name:string,
  unit:string,
  amount:string,
  dueDate:Date,
  fullName:string,
  userName:string,
}
@Component({
  selector: 'app-user-dialog',
  templateUrl: './users-dialog.component.html'
})
export class UsersDialogComponent implements OnInit {
  ROLE = ROLE;
  ACCOUNT_TYPE=ACCOUNT_TYPE;
  COMMON_STATUS = COMMON_STATUS;
  title: string = '';
  inputData: any;
  role:any;
  checkAction:any;
  isLoading: boolean = false;
  listCompany:any;
  listGroup:any;
  accountType:any;
  companyId:any;
  typeUser:any;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    fullname: [null],
    username: [null],
    email:[null],
    phone: [null],
    address:[null],
    role:[null],
    status: [null],
    description:[null],
    companyId:[null],
    groupTeamId:[null],
    accountType:[null],
    idCardNo:[null],
    dataTotal:[null],
  }, {
    validators: this.validateUserForm()
  });
  lstStatus: any = [];
  constructor(public modal: NgbActiveModal,
              private translateService: TranslateService,
              public userProfileService: UserProfileService,
              private groupTeamService: GroupTeamService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
    const decoded: any = jwtDecode(token || '');
    this.accountType=decoded.accountType;
    this.role=decoded.role;
    if (this.role !== this.ROLE.ADMIN) {
      this.companyId = decoded.companyId; 
    }
  
    if (this.inputData) {
      this.dataForm.patchValue(this.inputData);
      this.accountType=this.inputData.accountType;
      this.companyId=this.inputData.companyId;
      if(this.companyId){
        this.dataForm.get('companyId').setValue(this.companyId);
       this.getAllGroup()     
       }
       if(this.companyId){
       this.getAllGroup();
    }
      // Cập nhật trạng thái control vai trò theo loại tài khoản khi edit
      this.updateRoleControl();
    } else {
      // Creating new user: if non-admin and accountType is PERSON, default role to Owner
      if (this.role !== this.ROLE.ADMIN && this.accountType === this.ACCOUNT_TYPE.PERSON) {
        this.dataForm.get('role')?.setValue(this.ROLE.ADMIN_COMPANY);
        this.getAllGroup();
      }
      // Đồng bộ trạng thái control vai trò theo loại tài khoản khi create
      this.updateRoleControl();
    }
    if (this.companyId) {
       this.getAllGroup(); 
    }
    debugger;
    this.dataForm.get("companyId").setValue(this.companyId);
    if (this.role !== this.ROLE.ADMIN) {
      this.dataForm.get('companyId')?.disable({ onlySelf: true, emitEvent: false });
    } else {
      this.dataForm.get('companyId')?.enable();
    }
  }


validateUserForm(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const getTrim = (ctrl: string) => {
      const v = group.get(ctrl)?.value;
      return typeof v === 'string' ? v.trim() : v;
    };

    const fullname = getTrim('fullname');
    const email = getTrim('email');
    const phone = getTrim('phone');
    const address = getTrim('address');
    const accountType = group.get('accountType')?.value;
    const companyId = group.get('companyId')?.value;
    const role = group.get('role')?.value;
    const idCardNo = getTrim('idCardNo');
    const errors: any = {};

    if (!fullname) errors.fullname = true;
    if (!idCardNo) errors.idCardNo = true;
    if (!accountType) errors.accountType = true;
    if (!role) errors.role = true;
    if (!phone) errors.phone = true;
    if (!email) errors.email = true;
    if (!address) errors.address = true;

    // Với loại tài khoản Công ty: yêu cầu chọn công ty
    if (accountType === ACCOUNT_TYPE.COMPANY) {
      if (!companyId) errors.companyId = true;
    }
    // Với loại tài khoản Đội nhóm: KHÔNG ràng buộc groupTeamId (UI vẫn hiển thị dấu sao)

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

save() {
       // this.isLoading= true;
    if(this.role!==ROLE.ADMIN){
      //this.dataForm.get('accountType').setValue(this.accountType);
      const accountTypeControl = this.dataForm.get('accountType');
      if(accountTypeControl) {
        accountTypeControl.setValue(this.accountType);
      }
    }
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      
      return;
    }
    // this.isLoading= true;
    // if(this.role!==ROLE.ADMIN){
    //   //this.dataForm.get('accountType').setValue(this.accountType);
    //   const accountTypeControl = this.dataForm.get('accountType');
    //   if(accountTypeControl) {
    //     accountTypeControl.setValue(this.accountType);
    //   }
    // }
    this.isLoading= true;
    debugger;
    const data = this.dataForm.getRawValue();
    // If creating new, omit username so it can be auto-generated
    if (!data.id) {
      delete data.username;
    }

    this.userProfileService.insertOrUpdate(data.id, data).subscribe(res => {
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
        // this.isLoading= false;
      }else{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          width: '20em',
          title: "Đã có lỗi xảy ra vui lòng thử lại ",
          showConfirmButton: false,
          timer: 2500
        });
        this.isLoading= false;
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
    //this.isLoading= false;
  }

// save() {
//     // 1. [SỬA LỖI 1] Gán accountType TRƯỚC khi kiểm tra Validate
//     // Vì Owner không hiện ô chọn accountType, ta phải gán ngầm giá trị vào form trước
//     if (this.role !== this.ROLE.ADMIN) {
//         // Kiểm tra xem control có tồn tại không để tránh lỗi crash
//         const accountTypeControl = this.dataForm.get('accountType');
//         if (accountTypeControl) {
//             accountTypeControl.setValue(this.accountType);
//         }
//     }

//     // 2. Kiểm tra Validate
//     if (this.dataForm.invalid) {
//       this.dataForm.markAllAsTouched();
      
//       // LOG RA ĐỂ BIẾT LỖI GÌ (F12 -> Console)
//       console.log("❌ Form Invalid! Chi tiết lỗi:");
//       const controls = this.dataForm.controls;
//       for (const name in controls) {
//           if (controls[name].invalid) {
//               console.log(`- ${name}:`, controls[name].errors);
//           }
//       }
//       return; // Dừng lại nếu lỗi
//     }

//     this.isLoading = true;
    
//     // 3. Lấy dữ liệu (Dùng getRawValue để lấy cả các ô bị disable như Company)
//     const data = this.dataForm.getRawValue();

//     // Xóa username nếu là thêm mới (để backend tự sinh)
//     if (!data.id) {
//       delete data.username;
//     }

//     console.log("✅ Dữ liệu gửi đi:", data);

//     // 4. Gọi API
//     this.userProfileService.insertOrUpdate(data.id, data).subscribe({
//       next: (res) => {
//         if (res.body.body === true) {
//           Swal.fire({
//             position: 'top-end',
//             icon: 'success',
//             width: '20em',
//             title: data.id 
//                 ? this.translateService.instant('common.message.update-success') 
//                 : this.translateService.instant('common.message.insert-success'),
//             showConfirmButton: false,
//             timer: 2500
//           });
//           this.modal.close({ result: 'complete' });
//         } else {
//           Swal.fire({
//             position: 'top-end',
//             icon: 'error',
//             width: '20em',
//             title: "Đã có lỗi xảy ra vui lòng thử lại",
//             showConfirmButton: false,
//             timer: 2500
//           });
//         }
//         // [SỬA LỖI 2] Chỉ tắt loading khi có kết quả trả về
//         this.isLoading = false; 
//       },
//       error: (error) => {
//         Swal.fire({
//           position: 'top-end',
//           icon: 'error',
//           width: '20em',
//           title: error?.error?.message || "Lỗi hệ thống",
//           showConfirmButton: false,
//           timer: 2500
//         });
        
//         this.isLoading = false;
//       }
//     });
    
//     // ❌ TUYỆT ĐỐI KHÔNG ĐỂ this.isLoading = false Ở ĐÂY
// }
  get password() {
    return this.dataForm.get('password');
  }

  get rePassword() {
    return this.dataForm.get('rePassword');
  }
  getAllGroup(){
    const body={
      companyId:this.dataForm.get("companyId").value,
      accountType:this.dataForm.get("accountType").value
    }
    this.groupTeamService.findAllByCompanyId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listGroup = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  selectAccountType(){
    this.accountType=this.dataForm.get("accountType").value;
    this.dataForm.get("companyId").setValue(null);
    // If account type is PERSON, set default role to Owner
    if (this.accountType === this.ACCOUNT_TYPE.PERSON) {
      this.dataForm.get('role')?.setValue(this.ROLE.ADMIN_COMPANY);
    }
    this.getAllGroup();
    this.updateRoleControl();
  }

  private updateRoleControl() {
    const roleCtrl = this.dataForm.get('role');
    if (this.accountType === this.ACCOUNT_TYPE.PERSON) {
      roleCtrl?.setValue(this.ROLE.ADMIN_COMPANY, { emitEvent: false });
      roleCtrl?.disable({ onlySelf: true, emitEvent: false });
    } else {
      roleCtrl?.enable({ onlySelf: true, emitEvent: false });
    }
  }
}

