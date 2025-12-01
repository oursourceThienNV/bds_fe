// ==============================
// workspace-form.component.ts
// ==============================
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserProfileService} from "../../../core/services/user.service";
import {jwtDecode} from "jwt-decode";
import {WorkspaceService} from "../../../core/services/services-app/workspace.service";
import Swal from "sweetalert2";
import {error} from "protractor";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workspace-form',
  templateUrl: './workspace-form.component.html',
  styleUrls: ['./workspace-form.component.css']
})
export class WorkspaceFormComponent implements OnInit {

  @Input() workspaceId: any; // 2. Dùng @Input() để nhận ID thay vì AotivatedRoute
  dataForm: FormGroup;
  title = 'Tạo không gian làm việc';
  companyId:any;

  // Người dùng đơn lẻ
  listUser:any[] = [];

  selectedUserToAdd: number;
  selectedRoleToAdd: string;

  workspaceRoles = [
    { label: 'Chủ sở hữu', value: 'OWNER' },
    { label: 'Sửa', value: 'EDIT' },
    { label: 'Xem', value: 'VIEW' }
  ];

  addedUsers: any[] = [];
  checkAllAdded: boolean = false;
  constructor(private fb: FormBuilder, 
              private userService: UserProfileService,
              private workspaceService: WorkspaceService,
              public activeModal: NgbActiveModal, // 3. Inject NgbActiveModal
  ) {}

  async ngOnInit() {
    this.dataForm = this.fb.group({
      id:[''],
      code: ['', Validators.required],
      name: ['', [Validators.required]],
      description: [''],
      companyId: ['']
    });
    this.dataForm.patchValue({code: 'WS-' + new Date().getTime()});
    const token = localStorage.getItem("authData");
    const decoded: any = jwtDecode(token);
    this.companyId = decoded.companyId;
    await this.getAllUserService()
    // 4. Kiểm tra ID từ @Input() thay vì route
    if (this.workspaceId) {
      this.title = 'Cập nhật không gian làm việc'; // Cập nhật tiêu đề
      await this.getDetailById(this.workspaceId);
    }
  }
  getDetailById(id: any) {
    const body = { id: id };
    this.workspaceService.findDetailById(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        const users = res.body.body.listUser || [];

        // Ghép thông tin userId từ API detail với danh sách listUser đầy đủ
        this.addedUsers = users.map(u => {
          const fullUserInfo = this.listUser.find(x => x.id === u.userId);
          return {
            ...fullUserInfo,
            role: u.role || 'VIEW',
            checked: false
          };
        }).filter(u => u); // bỏ undefined nếu không tìm thấy user

        // Patch form data
        this.dataForm.patchValue({
          id:res.body.body.workSpace.id,
          code: res.body.body.workSpace.code,
          name: res.body.body.workSpace.name,
          description: res.body.body.workSpace.description
        });
      } else {
        console.error('Lỗi lấy chi tiết workspace:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }


  getAllUserService(){
    debugger;

    const body={
      companyId:this.companyId
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
  addUser(): void {
    if (!this.selectedUserToAdd || !this.selectedRoleToAdd) return;
    const user = this.listUser.find(u => u.id === this.selectedUserToAdd);
    if (!user || this.addedUsers.find(u => u.id === user.id)) return;
    this.addedUsers.push({ ...user, role: this.selectedRoleToAdd, checked: false });
    this.selectedUserToAdd = null;
    this.selectedRoleToAdd = null;
  }

  removeUser(index: number): void {
    this.addedUsers.splice(index, 1);
  }

  toggleAllAddedUsers(state: boolean): void {
    this.addedUsers.forEach(u => u.checked = state);
  }

  updateCheckAllAddedState(): void {
    const selected = this.addedUsers.filter(u => u.checked).length;
    this.checkAllAdded = selected === this.addedUsers.length;
  }

  hasCheckedUsers(): boolean {
    return this.addedUsers.some(u => u.checked);
  }

  removeCheckedUsers(): void {
    this.addedUsers = this.addedUsers.filter(u => !u.checked);
    this.checkAllAdded = false;
  }

  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    const formValue = this.dataForm.value;
    const payload = {
      id:formValue.id,
      code: formValue.code,
      name: formValue.name,
      description: formValue.description,
      workSpaceJoinUserList: this.addedUsers.map(u => ({ userId: u.id, role: u.role }))
    };
    console.log('Payload:', payload);
    this.workspaceService.insertOrUpdate(payload).subscribe({
      next: (res) => {
          if (res.body?.body === true) {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Cập nhật thành công',
              showConfirmButton: false,
              timer: 2000
            });
            // 5. Đóng modal và trả về tín hiệu "thành công"
          this.activeModal.close(true); 
        } else {
          this.showError('Đã có lỗi xảy ra, vui lòng thử lại');
        }
        },
          error: (err) => {
          this.showError(err?.error?.message || 'Lỗi hệ thống');
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
// 6. Tạo hàm mới để đóng modal
  dismiss(): void {
    // Đóng modal mà không trả về gì (nghĩa là "Huỷ")
    this.activeModal.dismiss('cancel');
  }

  goBack(): void {
    this.dismiss();
  }
}
