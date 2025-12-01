import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { MediaService } from "../../../core/services/services-app/media.service";
import { HttpEventType } from "@angular/common/http";
import Swal from "sweetalert2";
import { TaskStatusServices } from "../../../core/services/services-app/task-status.service";
import { UserProfileService } from "../../../core/services/user.service";
import { TaskServices } from "../../../core/services/services-app/task-service";
import { GroupTeamService } from "../../../core/services/services-app/group-team.service";
import { jwtDecode } from "jwt-decode";

interface SelectedFile {
  id?: number;     // có nếu là file cũ hoặc file mới sau upload
  file?: File;     // có nếu là file mới
  name: string;
  url?: string;
}
interface SubTask {
  code: string;
  title: string;
  assignee: string;
  priority: string;
  status: string;
  dueDate: string;
}
@Component({
  selector: 'app-create-task',
  templateUrl: './task-create-dialog.component.html',
  styleUrls: ['./task-create-dialog.component.scss']
})
export class TaskCreateDialogComponent implements OnInit {
  createTaskForm: FormGroup;
  title: any;
  selectedFiles: any[] = [];
  listStatus: [] = [];
  listUser: [] = [];
  listDepartment: [] = [];
  workSpaceId: any;
  inputData: any;
  listFile: any;
  subForm!: FormGroup;
  subtaskForm!: FormGroup;

  // Danh sách các công việc con đã thêm
  subtaskList: any[] = [];

  // Trạng thái hiển thị form thêm mới
  showAddForm = false;
  action: any;
  
  // Drag and drop state
  isDragOver = false;
  constructor(private fb: FormBuilder, public modal: NgbActiveModal, private mediaService: MediaService, private taskStatusService: TaskStatusServices, private userService: UserProfileService, private taskService: TaskServices, private groupTeamService: GroupTeamService) { }
  ngOnInit(): void {
    this.createTaskForm = this.fb.group({
      name: ['', [Validators.required]],        // Tên công việc, bắt buộc
      code: ['', [Validators.required]],        // Mã công việc, bắt buộc
      status: ['start', [Validators.required]],  // Trạng thái công việc, mặc định "bắt đầu"
      description: [''],                        // Mô tả công việc (tùy chọn - không required)
      assigned: ['', [Validators.required]],    // Người phụ trách, bắt buộc
      priority: ['medium', [Validators.required]], // Mức độ ưu tiên, mặc định "trung bình"
      createdBy: [''],                          // Người tạo
      listFile: [[]],                           // File (tùy chọn - không required)
      department: ['', [Validators.required]],  // Phòng ban, bắt buộc
      workSpaceId: ['', [Validators.required]], // Workspace ID, bắt buộc
      id: [''],                                 // ID (khi update)
      recipients: [[], [Validators.required]],  // Người tiếp nhận, bắt buộc
      dueDate: ['', [Validators.required]]      // Ngày hết hạn, bắt buộc
    });
    this.subtaskForm = this.fb.group({
      code: [''],                              // Mã (tự sinh nếu không nhập)
      title: ['', [Validators.required]],     // Tiêu đề, bắt buộc
      assignee: ['', [Validators.required]],   // Người thực hiện, bắt buộc
      priority: ['medium', [Validators.required]], // Mức độ ưu tiên, mặc định "trung bình"
      status: ['', [Validators.required]],    // Trạng thái, bắt buộc (sẽ set mặc định sau khi load listStatus)
      dueDate: ['', [Validators.required]]    // Ngày hết hạn, bắt buộc
    });

    const authWs = localStorage.getItem('authWs');
    if (authWs) {
      const decodedWs: any = jwtDecode(authWs);
      this.workSpaceId = decodedWs.workSpaceId
    }
    if (this.workSpaceId) {
      this.getListStatus();
      this.getListUser();
      this.getListDepartment();
      this.createTaskForm.get("workSpaceId")?.setValue(this.workSpaceId);
      this.createTaskForm.patchValue({
        code: 'SR-' + new Date().getTime(),
        status: 'start',  // Mặc định "bắt đầu"
        priority: 'medium'  // Mặc định "trung bình"
      });
    }
    if (this.inputData) {
      this.createTaskForm.patchValue(this.inputData);
      const { date } = this.splitDateTime(this.inputData.dueDate);
      this.createTaskForm.patchValue({ dueDate: date });
      this.createTaskForm.get("dueTime")?.setValue(this.inputData.dueDate);
      this.selectedFiles = this.listFile;

      // Đảm bảo status và priority có giá trị nếu không có trong inputData
      if (!this.inputData.status || this.inputData.status === '') {
        this.createTaskForm.get("status")?.setValue('start');
      }
      if (!this.inputData.priority || this.inputData.priority === '') {
        this.createTaskForm.get("priority")?.setValue('high');
      }
    }
  }
  isLoading = false;
  getListStatus() {
    const body = {
      workSpaceId: this.workSpaceId
    }
    this.taskStatusService.listTaskStatusByWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listStatus = res.body.body;

        // Set giá trị mặc định cho status trong subtaskForm (status đầu tiên hoặc "start")
        if (this.listStatus && this.listStatus.length > 0) {
          const defaultStatus = (this.listStatus as any[])[0]?.code || 'start';
          this.subtaskForm.get('status')?.setValue(defaultStatus);
        } else {
          this.subtaskForm.get('status')?.setValue('start');
        }

        // Đảm bảo status trong createTaskForm có giá trị mặc định nếu chưa có
        const currentStatus = this.createTaskForm.get('status')?.value;
        if (!currentStatus || currentStatus === '' || currentStatus === null) {
          this.createTaskForm.get('status')?.setValue('start');
        }
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
        // Set mặc định nếu lỗi
        this.subtaskForm.get('status')?.setValue('start');
        if (!this.createTaskForm.get('status')?.value) {
          this.createTaskForm.get('status')?.setValue('start');
        }
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
      // Set mặc định nếu lỗi
      this.subtaskForm.get('status')?.setValue('start');
      if (!this.createTaskForm.get('status')?.value) {
        this.createTaskForm.get('status')?.setValue('start');
      }
    });
  }
  isAllSelected = false;

  // So sánh id để khi mở lại dropdown các mục đã chọn vẫn checked

  onRecipientsChange(selectedIds: Array<string | number>) {
    const allIds = (this.listUser || []).map((u: any) => u?.id);
    this.isAllSelected = !!selectedIds?.length && selectedIds.length === allIds.length;
  }

  toggleSelectAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const allIds = (this.listUser || []).map((u: any) => u?.id);
    this.isAllSelected = checked;
    this.createTaskForm.get('recipients')?.setValue(checked ? allIds : []);
  }

  // chip dưới input
  get recipientsSelected() {
    const ids: Array<string | number> = this.createTaskForm.get('recipients')?.value ?? [];
    const byId = new Map((this.listUser || []).map((u: any) => [String(u?.id), u]));
    return ids.map(id => byId.get(String(id)) || { id, fullname: String(id) }).filter(Boolean);
  }

  removeRecipient(id: string | number) {
    const control = this.createTaskForm.get('recipients');
    const curr: Array<string | number> = control?.value ?? [];
    control?.setValue(curr.filter(x => String(x) !== String(id)));
  }
  compareIds = (a: any, b: any) => String(a) === String(b);

  // toggle chọn/bỏ CHỈ khi click checkbox
  onOptionCheckboxChange(item: any, selected: boolean) {
    const control = this.createTaskForm.get('recipients');
    const curr: Array<string | number> = control?.value ?? [];
    const id = item?.id ?? item; // vì bạn dùng bindValue="id"

    const next = selected
      ? curr.filter(x => String(x) !== String(id))                     // đang checked -> bỏ
      : (curr.some(x => String(x) === String(id)) ? curr : [...curr, id]); // chưa chọn -> thêm

    control?.setValue(next);
    this.onRecipientsChange(next); // giữ nguyên logic "Chọn tất cả" của bạn
  }
  getListUser() {
    const body = {
      workSpaceId: this.workSpaceId
    }
    this.userService.listUserWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listUser = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }

  getListDepartment() {
    const body = {
      workSpaceId: this.workSpaceId
    }
    this.groupTeamService.findAllByCompanyId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        this.listDepartment = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách đội nhóm:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }

  // Lấy danh sách người tiếp nhận cho tác vụ con
  getRecipientsForSubtask(): any[] {
    const recipients = this.createTaskForm.get('recipients')?.value || [];
    
    if (!recipients || recipients.length === 0) {
      return this.listUser || []; // Nếu chưa chọn người tiếp nhận, hiển thị tất cả user
    }
    
    // Lọc danh sách user theo những người đã được chọn trong recipients
    const filteredUsers = (this.listUser as any[]).filter((user: any) => recipients.includes(user.id));
    
    // Nếu không tìm thấy user nào, trả về tất cả user để tránh lỗi
    return filteredUsers.length > 0 ? filteredUsers : (this.listUser || []);
  }
  // private validateFile(file: File): string | null {
  //   const maxMB = 25; // tuỳ bạn
  //   if (file.size > maxMB * 1024 * 1024) return `File vượt quá ${maxMB}MB`;
  //   const okExt = ['pdf','doc','docx','xls','xlsx','png','jpg','jpeg','gif','zip','rar','txt'];
  //   const ext = file.name.split('.').pop()?.toLowerCase() || '';
  //   if (!okExt.includes(ext)) return 'Định dạng file không được hỗ trợ';
  //   return null;
  // }
  // Hàm xử lý submit form
  onSubmit(): void {
    console.log("👉 Submit form lớn");

    if (this.createTaskForm.invalid) {
      this.createTaskForm.markAllAsTouched();
      console.warn('❌ Form không hợp lệ', this.createTaskForm.value);
      return;
    }

    // đảm bảo không undefined
    this.selectedFiles = this.selectedFiles || [];

    const filesWithoutId = this.selectedFiles.filter(f => !f.id);
    const filesWithId = this.selectedFiles.filter(f => f.id);

    const fileIdList = filesWithId
      .map(f => f.id)
      .filter(id => !!id);

    // ❗ Trường hợp KHÔNG có file mới → lưu luôn
    if (filesWithoutId.length === 0) {
      console.log("📌 Không có file mới → lưu thẳng");

      this.createTaskForm.get("listFile").setValue(fileIdList);
      this.save();   // <-- CHẮC CHẮN sẽ chạy
      return;
    }

    // ❗ Có file mới → Upload
    const formData = new FormData();
    filesWithoutId.forEach(f => formData.append("files", f));

    this.mediaService.uploadMultiple(formData).subscribe({
      next: (res) => {
        const mediaIds = this.toMediaIdList(res);
        const mergedList = Array.from(new Set([...fileIdList, ...mediaIds]));

        this.createTaskForm.get("listFile").setValue(mergedList);

        console.log("📌 Upload thành công → lưu task");
        this.save();
      },
      error: (err) => {
        console.error("❌ Upload thất bại", err);
        this.showError(err?.error?.message || "Upload thất bại");
      }
    });
  }

  private toMediaIdList(res: any): number[] {
    const arr = res?.body ?? res?.data ?? res?.files ?? res?.items ?? (Array.isArray(res) ? res : []);
    return arr
      .map((x: any) => Number(x?.media?.id))
      .filter((id: any) => Number.isFinite(id));
  }
  save() {

    const v = this.createTaskForm.value;
    const combined = this.combineDateAndTimeSafe(v.dueDate); // => Date
    this.createTaskForm.get("dueDate").setValue(combined);

    // Đảm bảo status và priority có giá trị mặc định nếu null hoặc rỗng
    if (!v.status || v.status === '' || v.status === null || v.status === undefined) {
      this.createTaskForm.get("status")?.setValue('start');
      v.status = 'start'; // Cập nhật lại v để dùng trong data
    }
    if (!v.priority || v.priority === '' || v.priority === null || v.priority === undefined) {
      this.createTaskForm.get("priority")?.setValue('high');
      v.priority = 'high'; // Cập nhật lại v để dùng trong data
    }

    if (this.createTaskForm.invalid) {
      this.createTaskForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    // Lấy lại data sau khi đã set giá trị mặc định
    const data = this.createTaskForm.value;

    // Map subtaskList thành listSubTask với format đúng cho API
    const listSubTaskToSave = this.subtaskList.map((st: any) => {
      // Lấy userId từ assignee (có thể là ID hoặc object)
      let userId = st.assignee;
      if (st.assignee && this.listUser && this.listUser.length > 0) {
        const user = (this.listUser as any[]).find((u: any) =>
          String(u.id) === String(st.assignee) ||
          String(u.userId) === String(st.assignee)
        );
        if (user) {
          userId = user.id || user.userId || st.assignee;
        }
      }

      // Map dueDate sang ISO string nếu là Date
      let dueDateValue = st.dueDate;
      if (dueDateValue instanceof Date) {
        dueDateValue = dueDateValue.toISOString();
      } else if (dueDateValue && typeof dueDateValue === 'string') {
        // Nếu là string date, convert sang ISO
        const date = new Date(dueDateValue);
        if (!isNaN(date.getTime())) {
          dueDateValue = date.toISOString();
        }
      }

      return {
        code: st.code || '',
        taskName: st.title || st.taskName || st.name || '',
        status: st.status || '',
        dueDate: dueDateValue || null,
        userId: userId || null
      };
    });

    // Gửi listSubTask trong data của task (array)
    // Nếu không có subtasks, gửi array rỗng để tránh lỗi NullPointerException
    data.listSubTask = listSubTaskToSave || [];

    // Console log 1: Data gửi lên API
    console.log("📤 Data gửi lên API:", JSON.stringify(data, null, 2));

    this.taskService.insertOrUpdate(data).subscribe({
      next: (res) => {
        // Console log 2: API trả về
        console.log("📥 API trả về:", JSON.stringify(res, null, 2));

        if (res.body?.body === true) {

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Thêm mới thành công',
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
  onFileSelect(event: any): void {
    debugger;
    const files = event.target.files;
    if (this.selectedFiles === undefined) {
      this.selectedFiles = [];
    }
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
      event.dataTransfer?.clearData();
    }
  }
  private splitDateTime(datetime: Date | string | null): {
    date: Date | null,
  } {
    debugger;
    if (!datetime) return { date: null };
    const d = new Date(datetime);
    return {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate())
    };
  }
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa-file-pdf text-danger';
      case 'doc':
      case 'docx': return 'fa-file-word text-primary';
      case 'xls':
      case 'xlsx': return 'fa-file-excel text-success';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return 'fa-file-image text-warning';
      case 'zip':
      case 'rar': return 'fa-file-archive text-secondary';
      case 'txt': return 'fa-file-alt text-muted';
      default: return 'fa-file text-muted';
    }
  }
  private combineDateAndTimeSafe(
    date: Date | string | null,
  ): Date | null {
    if (!date) return null;

    let y: number, m: number, d: number;

    // Chuẩn hoá ngày
    if (date instanceof Date) {
      y = date.getFullYear();
      m = date.getMonth();
      d = date.getDate();
    } else if (typeof date === 'string') {
      // parse theo định dạng yyyy-mm-dd
      const parts = date.split('-').map(Number);
      if (parts.length >= 3) {
        y = parts[0];
        m = parts[1] - 1;
        d = parts[2];
      } else {
        const tmp = new Date(date);
        y = tmp.getFullYear();
        m = tmp.getMonth();
        d = tmp.getDate();
      }
    } else {
      return null;
    }

    // Chuẩn hoá giờ
    // let hh = 0, mm = 0, ss = 0;
    // if (time instanceof Date) {
    //   hh = time.getHours();
    //   mm = time.getMinutes();
    //   ss = time.getSeconds();
    // } else if (typeof time === 'string') {
    //   const tparts = time.split(':').map(Number);
    //   hh = tparts[0] || 0;
    //   mm = tparts[1] || 0;
    //   ss = tparts[2] || 0;
    // } else if (typeof time === 'object' && typeof time.hour === 'number') {
    //   hh = time.hour ?? 0;
    //   mm = time.minute ?? 0;
    //   ss = time.second ?? 0;
    // }

    return new Date(y, m, d);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  //  Các hàm xử lý tác vụ con
  /** Khi bấm "Thêm tác vụ con" */
  onAddSubtask(): void {
    this.showAddForm = true;
    // Lấy status đầu tiên từ listStatus nếu có, nếu không thì dùng "start"
    const defaultStatus = (this.listStatus && this.listStatus.length > 0)
      ? (this.listStatus as any[])[0]?.code
      : 'start';
    
    // Lấy mã công việc chính
    const parentCode = this.createTaskForm.get('code')?.value || 'TASK';
    
    // Tạo số thứ tự SUB (01, 02, 03...)
    const index = (this.subtaskList.length + 1).toString().padStart(2, '0');
    
    // Tự động tạo mã tác vụ con
    const autoCode = `${parentCode} - ${index}`;
    
    // Lấy danh sách người tiếp nhận từ form chính
    const recipients = this.createTaskForm.get('recipients')?.value || [];
    
    this.subtaskForm.reset({
      code: autoCode,
      priority: 'medium',  // Mặc định "trung bình"
      status: defaultStatus,
      assignee: recipients.length > 0 ? recipients[0] : null  // Chọn người đầu tiên làm mặc định
    });
  }

  /** Lưu tác vụ mới */
  saveSubtask(): void {
    // 1. Validate form - mark all fields as touched để hiển thị lỗi
    if (this.subtaskForm.invalid) {
      this.subtaskForm.markAllAsTouched();
      return;
    }

    // 2. Lấy dữ liệu mới (mã đã được tự động生成 trong onAddSubtask)
    const newSubtask = { ...this.subtaskForm.value };

    // 3. Thêm vào danh sách subtask
    this.subtaskList.push(newSubtask);

    // 4. Ẩn form thêm
    this.showAddForm = false;

    // 5. Reset form và giữ default
    const defaultStatus = (this.listStatus && this.listStatus.length > 0)
      ? (this.listStatus as any[])[0]?.code
      : 'start';
    this.subtaskForm.reset({
      priority: 'medium',  // Mặc định "trung bình"
      status: defaultStatus
    });
  }


  /** Hủy thêm tác vụ */
  cancelAdd(): void {
    this.showAddForm = false;
    const defaultStatus = (this.listStatus && this.listStatus.length > 0)
      ? (this.listStatus as any[])[0]?.code
      : 'start';
    this.subtaskForm.reset({
      priority: 'high',  // Mặc định "cao"
      status: defaultStatus
    });
  }

  /** Chia sẻ tác vụ */
  shareSubtask(task?: any): void {
    if (task) {
      alert(`Đã chia sẻ công việc: ${task.title}`);
    } else {
      alert('Chưa có công việc cụ thể để chia sẻ.');
    }
  }

  /** Chỉnh sửa tác vụ */
  editSubtask(task: any): void {
    this.showAddForm = true;
    this.subtaskForm.patchValue(task);

    // Xóa task cũ khỏi danh sách để sau khi lưu thì cập nhật lại
    this.subtaskList = this.subtaskList.filter(t => t !== task);
  }

  /** Xóa tác vụ */
  deleteSubtask(task: any): void {
    if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}" không?`)) {
      this.subtaskList = this.subtaskList.filter(t => t !== task);
    }
  }

  /** Helper: Lấy tên người dùng từ ID */
  getAssigneeName(assigneeId: any): string {
    if (!assigneeId || !this.listUser || this.listUser.length === 0) {
      return assigneeId || '';
    }
    const user = (this.listUser as any[]).find((u: any) =>
      String(u.id) === String(assigneeId) ||
      String(u.userId) === String(assigneeId)
    );
    return user?.fullname || user?.displayName || user?.name || String(assigneeId);
  }

  /** Helper: Lấy tên trạng thái từ code */
  getStatusName(statusCode: any): string {
    if (!statusCode || !this.listStatus || this.listStatus.length === 0) {
      return statusCode || '';
    }
    const status = (this.listStatus as any[]).find((s: any) =>
      String(s.code) === String(statusCode)
    );
    return status?.name || status?.label || String(statusCode);
  }

  /** Format file size */
  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /** Get file type from extension */
  getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ext || 'unknown';
  }

  /** Clear all files */
  clearAllFiles(): void {
    if (confirm('Bạn có chắc muốn xóa tất cả file đã chọn không?')) {
      this.selectedFiles = [];
    }
  }

  /** Preview file */
  previewFile(file: any): void {
    // Create a temporary URL for preview
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (file.url) {
      window.open(file.url, '_blank');
    } else {
      // For files that don't have preview capability
      alert('File này không hỗ trợ xem trước. Vui lòng tải xuống để xem.');
    }
  }

  /** Download file */
  downloadFile(file: any): void {
    if (file instanceof File) {
      // Create a temporary download link
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up the URL
      URL.revokeObjectURL(url);
    } else if (file.url) {
      // Download from server URL
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Không thể tải xuống file này.');
    }
  }

}