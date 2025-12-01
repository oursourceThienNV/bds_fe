import {ChangeDetectorRef, Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TaskStatusServices} from "../../../core/services/services-app/task-status.service";
import {jwtDecode} from "jwt-decode";
import {NgSelectComponent} from "@ng-select/ng-select";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
import {ActivatedRoute, Router} from "@angular/router";
import {TaskServices} from "../../../core/services/services-app/task-service";
import {TaskCommentServices} from "../../../core/services/services-app/task-comment.services";
import {UserProfileService} from "../../../core/services/user.service";
import {WebSocketService} from "../../../core/services/services-app/WebSocketService";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TASK_COMMENT} from "../Contants";
import {MediaService} from "../../../core/services/services-app/media.service";
type IdLike = number | null | undefined;
interface SubTaskDTO {
  id?: number;
  code?: string;
  taskName?: string;
  userId?: number | string | null;
  dueDate?: string | Date | null; // server có thể trả string
  status?: string;
  statusName?:string,
  no:string,
}
type EditState = {
  description: boolean;
  files: boolean;
  recipients: boolean;
  assigned: boolean;
  priority: boolean;
  dueDate: boolean;
  status: boolean;
};
interface MediaServices {
  uploadMultiple(fd: FormData): import('rxjs').Observable<any>;
}
type EditableField = keyof EditState;
interface TaskService {
  changeTask(body: any): import('rxjs').Observable<any>;
}
interface Recipient { id: string; fullname: string; username?: string; displayName?: string; }

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detai.component.scss']
})
export class IssueDetailComponent implements OnDestroy {
  listStatus:[]=[];
  description:'';
  // Demo task (thay bằng @Input() hoặc API của bạn)
  task: any;
  code:any;
  workSpaceId:any;
  /* ===== Main form: mô tả + recipients ===== */
  mainForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    recipients: [[], Validators.required]
  });

  listUser:any;
  assigned = 'u01';

  /* ===== Upload ===== */
  selectedFiles: any[] = [];
  private objectUrlMap = new Map<File, string>();

  /* ===== Subtasks ===== */
  subForm: FormGroup = this.fb.group({
    subtasks: this.fb.array([])
  });

  statusOptions:any;
  members:any;

  /* ===== Activity ===== */
  newComment = '';
  comments: Array<{ userName: string; fullName: string; comment: string; createdAt: Date; }> = [];
  recipientsSelected: Array<{ id: string | number; fullname: string }> = [];

// (tuỳ chọn) nếu API trả users đã join task (đủ thông tin)
  userJoinTaskView: any[] = [];
  priority:any;
  dueDate:any;
  dueTime:any;
  status:any;
// So sánh id
  // issue-detail.component.ts
  countSubtask = 2;
  countDone = 2;

  get percent(): number {
    if (!this.countSubtask) return 0;
    const p = Math.round((this.countDone / this.countSubtask) * 100);
    return Math.min(100, Math.max(0, p));
  }
  compareIds = (a: any, b: any) => String(a) === String(b);
  isAllSelected = false;
  constructor(private fb: FormBuilder,
              private api: ApiUrl,
              private cdRef: ChangeDetectorRef,
              private taskStatusService:TaskStatusServices,private mediaServices:MediaService,
              private router: Router,private route: ActivatedRoute,private taskService:TaskServices,private commentService:TaskCommentServices,private userService: UserProfileService,private webSocketService: WebSocketService,private modalService: NgbModal,
  ) {
    this.reviewForm = this.fb.group({
      deliveryContent: ['', Validators.required],
      feedbackNote: ['']
    });
  }
  async ngOnInit(): Promise<void> {
    this.mainForm.get('recipients')?.valueChanges.subscribe(() => this.buildRecipientsSelected());
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
      console.log(params['code']);
    });
    const authWs = localStorage.getItem('authWs');
    if (authWs) {
      const decodedWs: any = jwtDecode(authWs);
      this.workSpaceId = decodedWs.workSpaceId
    }
    if (this.workSpaceId) {
      await this.getListStatus();
      await this.getListUser();
      await this.getDetail();
      this.connectComment();
    }
  }
  async getDetail(): Promise<void> {
    const body={
      code:this.code
    }
    this.taskService.findById(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.task = res.body.body.taskDetailDTO;
        this.description=this.task?.description;
        this.selectedFiles=res.body.body.listMedia;
        const users = res.body.body.userJoinTaskView || [];
        const selectedIds = users.map((u: any) => u.userId);
        this.assigned=this.task?.assigned;
        this.mainForm.patchValue({ recipients: selectedIds });
        this.priority=this.task?.priority;
        this.status=this.task?.status;
// cập nhật trạng thái "chọn tất cả" v.v.
        this.onRecipientsChange(selectedIds);
        this.comments=res.body.body.userTaskComments;
        this.members=this.recipientsSelected;
        this.comments=res.body.body.userTaskComments;
        const list = this.readNested(res, ['body','body','listSubTasks']) as SubTaskDTO[] || [];
        this.setSubtasks(list);
        this.countSubtask=res.body.body.countSubtask;
        this.countDone=res.body.body.countDone;
        const { date: dueDate } = this.splitDateTime(this.task.dueDate);
        debugger;
        this.dueDate=dueDate;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  private readNested(obj: any, path: (string|number)[]) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
  }
  private  splitDateTime(datetime: Date | string | null): {
    date: Date | null,
  } {
    debugger;
    if (!datetime) return { date: null};
    const d = new Date(datetime);
    return {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate())
    };
  }
  private buildSubtaskGroup(st?: Partial<SubTaskDTO>): FormGroup {
    return this.fb.group({
      id: [st?.id ?? null],
      code: [st?.code ?? null],
      taskName: [st?.taskName ?? null, [Validators.required]],
      userId: [st?.userId ?? null],
      // bsDatepicker nên bind Date object
      dueDate: [this.toDate(st?.dueDate ?? null)],
      status: [st?.status ?? 'NEW', [Validators.required]],
      no:[st.no]
    });
  }

  /** Nạp dữ liệu từ API vào FormArray */
  private setSubtasks(data: SubTaskDTO[]) {
    const arr = data?.map((st) => this.buildSubtaskGroup(st)) ?? [];
    this.subForm.setControl('subtasks', this.fb.array(arr));
    this.cdRef.markForCheck();
  }
  private toDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return v;

    // Chuẩn hoá: "YYYY-MM-DD HH:mm:ss.SSSSSS" -> "YYYY-MM-DDTHH:mm:ss.SSS"
    let s = String(v).trim();
    s = s.replace(' ', 'T');               // space -> T
    s = s.replace(/Z$/i, '');              // bỏ Z cho Date local nếu muốn
    s = s.replace(/\.(\d{1,6})/, (_: any, frac: string) => {
      // cắt về mili-giây (3 chữ số) để tránh edge-case microseconds
      const ms = (frac + '000').slice(0, 3);
      return '.' + ms;
    });

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  async getListStatus(){
    const body={
      workSpaceId:this.workSpaceId
    }
    await this.taskStatusService.listTaskStatusByWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listStatus = res.body.body;
        this.statusOptions=res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  async getListUser(){
    const body={
      workSpaceId:this.workSpaceId
    }
    await this.userService.listUserWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listUser = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }


  /* ---------- Recipients ---------- */


  @ViewChild('recipientsSelect', { static: false })
  recipientsSelect?: NgSelectComponent;

  onRecipientsOpen() {
    // clear keyword để dropdown hiện full list ngay khi mở
    this.recipientsSelect && (this.recipientsSelect.searchTerm = '');
  }

  /** Build lại danh sách chips từ control 'recipients' */
  private buildRecipientsSelected(): void {
    const raw = this.mainForm.get('recipients')?.value ?? []; // ['u01', ...] hoặc [{id:'u01',...}]
    // Hợp nhất nguồn lookup: listUser + userJoinTaskView (đảm bảo có fullname)
    const merged = [...(this.listUser || []), ...(this.userJoinTaskView || [])];

// Map theo id dạng string
    const byId = new Map(
      merged.map((u: any) => [String(u.id ?? u.userId ?? u.value), u])
    );

// raw có thể là ['u01', 'u02'] hoặc [{id:'u01', ...}]
    this.recipientsSelected = (raw || []).map((v: any) => {
      const id = (v && typeof v === 'object') ? (v.id ?? v.userId ?? v.value) : v;
      const user = byId.get(String(id));

      // Fallback tên: fullname -> fullName -> displayName -> chính id
      const fullname = user?.fullname ?? user?.fullName ?? user?.displayName ?? v?.fullname ?? String(id);

      return { id, fullname };
    });
    debugger;
    this.members= this.recipientsSelected;
  }

// Khi danh sách chọn thay đổi
  onRecipientsChange(selectedIds: Array<string | number>) {
    const allIds = (this.listUser || []).map((u: any) => u?.id);
    this.isAllSelected = !!selectedIds?.length && allIds.length > 0 && selectedIds.length === allIds.length;
    this.buildRecipientsSelected();
  }

// Chọn tất cả
  toggleSelectAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const allIds = (this.listUser || []).map((u: any) => u?.id);
    this.isAllSelected = checked;
    this.mainForm.get('recipients')?.setValue(checked ? allIds : []);
    this.buildRecipientsSelected();
  }

// Xoá 1 chip
  removeRecipient(id: string | number) {
    const control = this.mainForm.get('recipients');
    const curr: Array<string | number> = control?.value ?? [];
    control?.setValue(curr.filter(x => String(x) !== String(id)));
    this.buildRecipientsSelected();
  }

// Tick/untick trong dropdown
  onOptionCheckboxChange(item: any, selected: boolean) {
    const control = this.mainForm.get('recipients');
    const curr: Array<string | number> = control?.value ?? [];
    const id = item?.id ?? item;

    const next = selected
      ? curr.filter(x => String(x) !== String(id))
      : (curr.some(x => String(x) === String(id)) ? curr : [...curr, id]);

    control?.setValue(next);
    this.onRecipientsChange(next); // sẽ build bên trong
  }
  /* ---------- Upload ---------- */
  onFileSelect(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.selectedFiles = [...this.selectedFiles, ...files];
  }
  onFileDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    this.selectedFiles = [...this.selectedFiles, ...files];
  }
  onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); }
  onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); }

  removeFile(i: number) {
    const f = this.selectedFiles[i];
    if (f instanceof File) {
      const url = this.objectUrlMap.get(f);
      if (url) { URL.revokeObjectURL(url); this.objectUrlMap.delete(f); }
    }
    this.selectedFiles.splice(i, 1);
    this.selectedFiles = [...this.selectedFiles];
  }

  fileHref(file: any): string | null {
    if (file?.downloadUrl) return file.downloadUrl;
    if (file?.url) return file.url;
    if (file instanceof File) {
      let url = this.objectUrlMap.get(file);
      if (!url) { url = URL.createObjectURL(file); this.objectUrlMap.set(file, url); }
      return url;
    }
    return null;
  }

  getFileIcon(name: string) {
    const ext = (name?.split('.').pop() || '').toLowerCase();
    if (['pdf'].includes(ext)) return 'fa-file-pdf text-danger';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word text-primary';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'fa-file-excel text-success';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'fa-file-image text-warning';
    if (['zip', 'rar', '7z'].includes(ext)) return 'fa-file-archive text-secondary';
    return 'fa-file-alt text-muted';
  }

  /* ---------- Subtasks ---------- */
  get subtasksFA(): FormArray { return this.subForm.get('subtasks') as FormArray; }
  get subtaskRows() { return this.subtasksFA.controls as FormGroup[]; }
  trackByIndex = (i: number) => i;
  completeAll(){
    const payload = {
      id: this.task.id,
      workSpaceId: this.workSpaceId
    };
    this.taskService.completeAll(payload).subscribe(res=>{
      this.getDetail();
      this.isModalOpen=false;
      this.closeReviewModal();

    })
  }
  addSubtask(prefill?: Partial<any>) {
    const fg = this.fb.group({
      code: [prefill?.code ?? this.nextChildCode(), Validators.required],
      taskName: [prefill?.taskName ?? '', Validators.required],
      userId: [prefill?.userId ?? null, Validators.required],
      dueDate: [prefill?.dueDate ?? new Date(), Validators.required], // Date cho bsDatepicker
      status: [prefill?.status ?? 'pending', Validators.required],
      no:[prefill?.no],
    });
    console.log(fg.getRawValue());
    this.subtasksFA.push(fg);
  }

  removeSubtask(i: number) {
    this.subtasksFA.removeAt(i);
    this.rebuildCodes();
  }

  saveSubtasks() {
    const payload = this.subtasksFA.getRawValue().map((r: any) => ({
      ...r,
      dueDate: r.dueDate instanceof Date ? r.dueDate.toISOString() : r.dueDate,taskName:r.taskName,code:r.code,status:r.status,userId:r.userId
    }));
    console.log("HHH",payload);
    const body={id: this.task.id, listSubTask: payload};
    this.taskService.changeTask(body).subscribe({
      next: res => {
        this.getDetail();
      },
      error: err => console.error('Lỗi kết nối đến server:', err)
    });
  }

  private nextChildCode(): string {
    const idx = this.subtasksFA.length + 1;
    return `${this.task?.code || 'AAA1234'}_${idx}`;
  }
  private rebuildCodes() {
    this.subtaskRows.forEach((fg, i) =>
      fg.get('code')!.setValue(`${this.task?.code || 'AAA1234'}_${i + 1}`));
  }

  /* ---------- Activity ---------- */
  postComment() {
    if (!this.newComment.trim()) return;

    const body = {
      workSpaceId: this.workSpaceId,
      taskId: this.task.id,
      comment: this.newComment
    };

    this.commentService.create(body).subscribe({
      next: (res) => {
        if (res.body?.body === true) {
          // Xóa nội dung input
          this.newComment = '';
          // Load lại danh sách comment
          this.getDetail();

        }
      },
      error: (err) => {
        console.error('Error posting comment:', err);
      }
    });
  }

  /* ---------- Cleanup ---------- */
  ngOnDestroy(): void {
    for (const url of this.objectUrlMap.values()) URL.revokeObjectURL(url);
    this.objectUrlMap.clear();
  }
  private isConnected = false;

  connectComment(){
    debugger;
    if (!this.isConnected) {
      this.webSocketService.connect(Number(this.workSpaceId));
      this.isConnected = true;
    }

    this.webSocketService.getStats().subscribe(stats => {
      console.log("Stats received from WebSocket: ", stats);
      if (stats === TASK_COMMENT.COMMENT) {
        this.getDetail();
      }
    });
  }


  editState: EditState = {
    description: false,
    files: false,
    recipients: false,
    assigned: false,
    priority: false,
    dueDate: false,
    status: false,
  };

  body: any = null;

  // ================= Helpers =================
  private uniqNumbers(arr: Array<IdLike>): number[] {
    return Array.from(
      new Set(
        arr.filter((x): x is number => Number.isFinite(x as number))
      )
    );
  }

  /** Chấp nhận nhiều shape payload trả về từ API upload */
  private toMediaIdList(res: any): number[] {
    const arr =
      res?.body ??
      res?.data ??
      res?.files ??
      res?.items ??
      (Array.isArray(res) ? res : []);

    return this.uniqNumbers(
      arr.map((x: any) =>
        Number(x?.media?.id ?? x?.mediaId ?? x?.id ?? x?.fileId)
      )
    );
  }

  // Chỉ cho 1 field edit tại 1 thời điểm
  enterEdit(k: EditableField): void {
    Object.keys(this.editState).forEach(key => (this.editState[key as EditableField] = false));
    this.editState[k] = true;
  }

  // ================= Core save =================
  async saveField(k: EditableField): Promise<void> {
    // khoá field ngay khi bắt đầu lưu
    this.editState[k] = false;

    try {
      switch (k) {
        case 'description': {
          this.body = { id: this.task?.id, description: this.description ?? '' };
          break;
        }
        case 'recipients': {
          const recipients = Array.isArray(this.recipientsSelected)
            ? this.uniqNumbers(this.recipientsSelected.map(x => Number(x?.id)))
            : [];
          this.body = { id: this.task?.id, recipients };
          break;
        }
        case 'assigned': {
          this.body = { id: this.task?.id, assigned: this.assigned ?? null };
          break;
        }
        case 'priority': {
          this.body = { id: this.task?.id, priority: this.priority ?? null };
          break;
        }
        case 'dueDate': {
          const combined = this.combineDateAndTimeSafe(this.dueDate, null); // Date local
          this.body = { id: this.task?.id, dueDate: combined };
          break;
        }
        case 'status': {
          this.body = { id: this.task?.id, status: this.status ?? null };
          break;
        }
        case 'files': {
          const selected = Array.isArray(this.selectedFiles) ? this.selectedFiles : [];
          const filesWithId = selected.filter(f => Number.isFinite(f?.id));
          const filesWithoutId = selected.filter(f => !Number.isFinite(f?.id));

          const existingIds = this.uniqNumbers(filesWithId.map(f => Number(f.id)));

          let uploadedIds: number[] = [];
          if (filesWithoutId.length > 0) {
            const formData = new FormData();
            filesWithoutId.forEach(f => formData.append('files', f, f.name ?? 'file'));
            const res = await this.mediaServices.uploadMultiple(formData).toPromise();
            uploadedIds = this.toMediaIdList(res);
          }

          const listFile = this.uniqNumbers([...existingIds, ...uploadedIds]);
          this.body = { id: this.task?.id, listFile };
          break;
        }
        default: {
          this.body = null;
        }
      }

      if (!this.body || !this.task?.id) return;

      await this.taskService.changeTask(this.body).toPromise();
      // TODO: cập nhật lại this.task từ response nếu backend trả về bản mới

    } catch (err) {
      console.error('Lưu thất bại:', err);
      // TODO: show toast lỗi
    } finally {
      this.getDetail();
      this.editState[k] = false;
    }
  }

  // ================= Date helpers =================
  private combineDateAndTimeSafe(dateOnly: string | Date, time?: string | Date | null): Date {
    const d = this.asDateOnly(dateOnly);
    const { h, m } = this.parseHM(time as any);
    const result = new Date(d);
    result.setHours(h, m, 0, 0);
    return result;
  }

  private asDateOnly(d: string | Date): Date {
    if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const [y, m, day] = (d ?? '').toString().split('-').map(Number);
    return new Date(y || 1970, (m || 1) - 1, day || 1);
  }

  /** Parse "HH:mm" -> {h,m} */
  private parseHM(t?: string | Date | null): { h: number; m: number } {
    if (!t) return { h: 0, m: 0 };
    if (t instanceof Date) return { h: t.getHours(), m: t.getMinutes() };
    const [hh, mm] = (t ?? '').toString().split(':').map(Number);
    return { h: hh || 0, m: mm || 0 };
  }
  showReviewModal = false;
  activeSubtaskIndex: number | null = null;
  activeSubtask: any = null;

  reviewForm: FormGroup;

  /** Mở popup */
  openReviewModal(i: number, subtask: any) {
    this.activeSubtaskIndex = i;
    this.activeSubtask = subtask || {};
    this.reviewForm.reset({ deliveryContent: '', feedbackNote: '' });
    this.showReviewModal = true;
  }

  /** Đóng popup */
  closeReviewModal() {
    this.showReviewModal = false;
    this.activeSubtaskIndex = null;
    this.activeSubtask = null;
  }

  /** Click nền tối để đóng */
  closeIfBackdrop(evt: MouseEvent) {
    // chỉ khi click ra ngoài khung dialog
    this.closeReviewModal();
  }

  /** Duyệt */
  async approveSubtask() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const payload = {
      id: this.activeSubtask.id,
      workSpaceId: this.workSpaceId
    };
    this.taskService.requesApprove(payload).subscribe(res=>{
      this.getDetail();
      this.isModalOpen=false;
      this.closeReviewModal();

    })
  }

  /** Yêu cầu sửa */
  async requestChanges() {
    const payload = {
      id: this.activeSubtask.id,
      workSpaceId: this.workSpaceId
    };
    this.taskService.requesEdit(payload).subscribe(res=>{
      this.getDetail();
      this.isModalOpen=false;
      this.closeReviewModal();

    })
  }
  isModalOpen = false;

  // Dữ liệu hàng đang thao tác
  active?: { code: string; title: string; assigneeName?: string; [k: string]: any };

  // List người duyệt (tuỳ bạn bind từ API)
  approvers = [{ id: 1, name: 'Thiện Nguyễn' }, { id: 2, name: 'Lan Phạm' }];

  handoverForm = this.fb.group({
    content: ['', Validators.required],
    approverId: [1, Validators.required]
  });

  openComplete(index: number, rowValue: any) {
    // map dữ liệu từ fg.value vào active để hiển thị lên modal
    this.active = {
      id:rowValue.id,
      code: rowValue.code || rowValue.no || 'N/A',
      title: rowValue.taskName || rowValue.title || '',
      assigneeName: rowValue.assigneeName || rowValue.assignee
    };
    this.isModalOpen = true;
    document.body.classList.add('modal-open'); // khóa scroll nền
  }

  close() {
    this.isModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  submit() {
    if (this.handoverForm.invalid) {
      this.handoverForm.markAllAsTouched();
      return;
    }
    const payload = {
      id: this.active.id,
      workSpaceId: this.workSpaceId
    };
    this.taskService.requesApprove(payload).subscribe(res=>{
        this.getDetail();
        this.isModalOpen=false;
    })

  }
  // changeStatus(s:any,index,rowValue:any){
  //   debugger;
  //   if(s.no==='CD'){
  //     this.openComplete(index, rowValue)
  //   }
  // }

  // ESC để đóng
  @HostListener('document:keydown.escape') onEsc() { if (this.isModalOpen) this.close(); }

  protected readonly events = module
}

