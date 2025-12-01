import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { CompanyService } from 'src/app/core/services/services-app/company.service';
import {ACCOUNT_TYPE, COMMON_STATUS, ROLE} from '../Contants';
import { MediaDialogComponent } from '../image/media-dialog.component';
import { ApiUrl } from 'src/app/shared/constant/ApiUrl.constant';
import { GroupTeamService } from 'src/app/core/services/services-app/group-team.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-team-dialog.component.html'
})
export class GroupTeamDialogComponent implements OnInit {
  COMMON_STATUS = COMMON_STATUS;
  title: string = 'Thêm mới đội nhóm';
  inputData: any;
  isLoading: boolean = false;
  listCompany:any[] = [];
  listUser:any[] = [];
  ROLE=ROLE;
  ACCOUNT_TYPE=ACCOUNT_TYPE;
  role:any;
  listGroup:any;
  selectedUserToAdd: number | null = null;
  accountType:any;
  addedUsers: any[] = []; // danh sách hiển thị
  dataForm: FormGroup = this.fb.group({
    id: [null],
    code:[null],
    name: [null, Validators.required],
    description: [null],
    status: [],
    companyId:[null, Validators.required],
    headUser:[null, Validators.required],
    rootId:[],
    userList: [[]], // <-- thêm dòng này
  });

  constructor(
    public modal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private groupTeamService: GroupTeamService,
    private api: ApiUrl,
    private modalService: NgbModal,
    private userService: UserProfileService,
  ) {}

  ngOnInit(): void {
    debugger;
    const token=localStorage.getItem("authData");
    const decoded: any = jwtDecode(token);
    this.role = decoded.role;
    this.accountType=decoded.accountType;
    if(this.role!==ROLE.ADMIN){
      this.dataForm.get("companyId").setValue(decoded.companyId);
      if (this.role !== this.ROLE.ADMIN) {
        this.dataForm.get('companyId')?.disable({ onlySelf: true, emitEvent: false });
      } else {
        this.dataForm.get('companyId')?.disable({ onlySelf: true, emitEvent: false });
      }
    }
    if (this.inputData) {
      this.title = 'Cập nhật đội nhóm';
      this.dataForm.patchValue(this.inputData);
      const inputId = this.dataForm.get('id')?.value || this.inputData?.id || this.inputData?.groupMainId || this.inputData?.groupId;
      if (inputId) {
        this.dataForm.get('id')?.setValue(inputId);
        this.getUserByGroupId();
      }
    } else {
      // Mặc định trạng thái hoạt động khi thêm mới
      this.title = 'Thêm mới đội nhóm';
      this.dataForm.get('status')?.setValue(this.COMMON_STATUS.ACTIVE);
    }
    this.getAllUserService();
    this.getAllGroup();
  }
addUser() {
  if (this.selectedUserToAdd == null) return;
  const selectedId = Number(this.selectedUserToAdd);
  const user = this.listUser.find(u => Number(u.id) === selectedId);
  if (user && !this.addedUsers.some(u => Number(u.id) === selectedId)) {
    this.addedUsers.push(user);
    const ids = this.addedUsers.map(u => Number(u.id));
    this.dataForm.get('userList')?.setValue(ids);
  }
  this.selectedUserToAdd = null;
}

removeUser(index: number) {
  this.addedUsers.splice(index, 1);
  const ids = this.addedUsers.map(u => Number(u.id));
  this.dataForm.get('userList')?.setValue(ids);
}
  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data = this.dataForm.getRawValue();
    this.groupTeamService.insertOrUpdate(data).subscribe({
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
  changeCompany(){
    this.getAllUserService();
    this.getAllGroup();
  }
  getAllUserService(){
    const body={
      companyId:this.dataForm.get("companyId").value
    }
    this.userService.findAllByCompanyId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listUser = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  getAllGroup(){
    const body={
      companyId:this.dataForm.get("companyId").value
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
  getUserByGroupId(){
    const formId = this.dataForm.get('id')?.value;
    const fallbackId = this.inputData?.id || this.inputData?.groupMainId || this.inputData?.groupId;
    const id = formId || fallbackId;
    if (!id) { return; }
    const body = {
      id: id,
      groupId: id,
      groupMainId: id
    } as any;
    this.userService.findUserByGroupId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.addedUsers = res.body.body;
        const ids = this.addedUsers.map(u => Number(u.id));
        this.dataForm.get('userList')?.setValue(ids);
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }

}
