import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import {TaskStatusServices} from "../../../core/services/services-app/task-status.service";
import {jwtDecode} from "jwt-decode";
@Component({
  selector: 'app-group-dialog',
  templateUrl: './task-status-dialog.component.html'
})
export class TaskStatusDialogComponent implements OnInit {
  title: string = 'Thêm/Cập nhật công ty';
  inputData: any;
  isLoading: boolean = false;
  selectedColor: string = '#ff0000'; // Màu mặc định
  dataForm: FormGroup = this.fb.group({
    id: [null],
    code:[null],
    name: [null, Validators.required],
    description: [null],
    workSpaceId:[null],
    color: [this.selectedColor],
  });
  accountType:any;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private taskStatusServices: TaskStatusServices,
  ) {}

  ngOnInit(): void {
    const authWs = localStorage.getItem('authWs');
    if(authWs) {
      const decodedWs: any = jwtDecode(authWs);
      const workSpaceId = decodedWs.workSpaceId
      this.dataForm.get("workSpaceId").setValue(workSpaceId);
    }
    if(this.inputData){
    this.dataForm.patchValue(this.inputData);
      this.selectedColor=this.inputData.color;
    }
  }

  // Danh sách các màu có thể chọn
  colorOptions = [
    { name: 'Đỏ', value: '#ff0000' },
    { name: 'Xanh lá', value: '#00ff00' },
    { name: 'Xanh dương', value: '#0000ff' },
    { name: 'Vàng', value: '#ffff00' },
    { name: 'Tím', value: '#800080' },
    { name: 'Cam', value: '#ff7f00' },
    { name: 'Xám', value: '#808080' },
    { name: 'Hồng', value: '#ff1493' }
  ];
  onColorSelect(event: any): void {
    debugger;
    this.selectedColor = event.target.value; // Cập nhật màu đã chọn
    this.dataForm.controls['color'].setValue(this.selectedColor); // Cập nhật giá trị trong form
  }
  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const data = this.dataForm.value;
    this.taskStatusServices.insertOrUpdate(data).subscribe({
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
