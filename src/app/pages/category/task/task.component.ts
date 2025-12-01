import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  OnDestroy,
  ViewChildren,
  ElementRef,
  HostListener,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";

import { Page } from "src/app/core/models/page.model";
import { TaskServices } from "../../../core/services/services-app/task-service";
import { TaskStatusServices } from "../../../core/services/services-app/task-status.service";
import { TaskStatusDialogComponent } from "../task-status/task-status-dialog.component";
import { TaskCreateDialogComponent } from "./task-create-dialog.component";

// CDK Drag&Drop (Angular 13)
import { CdkDrag, CdkDragDrop } from "@angular/cdk/drag-drop";
import {
  CalendarOptions,
  DateSelectArg,
  FullCalendarComponent,
} from "@fullcalendar/angular";

interface StatusGroup {
  code: string; // ví dụ: 'todo', 'doing', 'done'... trùng với group.code trả từ API trạng thái
  name: string; // nhãn hiển thị
  color?: string; // nếu backend có
}

interface Task {
  id?: string | number;
  code?: string;
  taskName: string;
  assignedTo?: string;
  status: string; // PHẢI có để lọc theo cột (trùng group.code)
  statusName?: string; // nếu cần hiển thị tên
  color?: string; // màu status nếu có
  priority?: "low" | "medium" | "high" | string;
  createCode?: string;
  userCreate?: string;
  createDt?: string | Date;
  dueDate?: string | Date;
  description?: string;
  // ... các field khác nếu có
}
type ViewMode = "day" | "week" | "month" | "quarter";

interface TierCell {
  label: string;
  x: number;
  px: number;
}
@Component({
  selector: "app-group",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
})
export class TaskComponent implements OnInit, AfterViewInit {
  @ViewChildren(CdkDrag) drags!: QueryList<CdkDrag>;

  ngAfterViewInit() {
    console.log("CDK drags found:", this.drags?.length); // phải > 0
  }

  role: any;
  tables: any[] = []; // bảng danh sách
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10; // Số item mỗi trang
  page = new Page();
  isLoading: boolean = false;

  workspaceId: any;
  isCheckView: "ds" | "hc" | "bo" | "ca" | "tl" = "ds";

  todayTask: any;

  // QUAN TRỌNG: phải có kiểu, tránh "never"
  listStatus: StatusGroup[] = [];
  tasks: Task[];
  // Hạn chót (dạng object)
  tasksHC: {
    overdue?: Task[];
    today?: Task[];
    thisWeek?: Task[];
    nextWeek?: Task[];
    // thisMonth?: Task[]; // nếu dùng thêm
  } = {};

  // Board: ta dùng MẢNG PHẲNG để lọc bằng *ngIf
  tasksBoard: Task[] = [];
  // ====== cấu hình giao diện ======
  rowHeight = 36;
  pxPerDay = 32; // sẽ thay đổi theo view
  canvasWidth = 0;

  view: ViewMode = "week";
  keyword = "";

  // ====== dữ liệu gốc & dữ liệu hiển thị ======
  viewRows: any;

  // ====== range hiển thị ======
  start!: Date;
  end!: Date;

  // ====== header ======
  topTier: TierCell[] = [];
  bottomTier: TierCell[] = [];

  // today line
  todayX: number | null = null;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private taskServices: TaskServices,
    private router: Router,
    private taskStatusService: TaskStatusServices,
    private taskService: TaskServices
  ) { }

  searchForm: FormGroup = this.fb.group({
    code: [null],
    name: [null],
    workSpaceId: [null],
    status: [null],
    assignedTo: [null],
    userCreate: [null],
  });
  tasksLine: any;
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0-11
  daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  daysArray: number[] = [];

  // Navigate to previous month
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateDaysArray();
  }

  // Navigate to next month
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateDaysArray();
  }

  // Update days array based on current month/year
  updateDaysArray() {
    this.daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.daysArray = Array.from({ length: this.daysInMonth }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    const token = localStorage.getItem("authData");
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
      const authWs = localStorage.getItem("authWs");
      if (authWs) {
        const decodedWs: any = jwtDecode(authWs);
        this.workspaceId = decodedWs.workSpaceId;
        this.searchForm.get("workSpaceId")?.setValue(this.workspaceId);
      }
    }
    this.loadPage(0);
    this.getListStatus();
    this.loadCalendar();
    this.daysArray = Array.from({ length: this.daysInMonth }, (_, i) => i + 1);
    // demo data
  }

  getListStatus() {
    const body = { workSpaceId: this.workspaceId };
    this.taskStatusService.listTaskStatusByWorkSpaceId(body).subscribe({
      next: (res: any) => {
        if (res && res.body?.responseCode === "200") {
          // Đảm bảo map đúng kiểu StatusGroup
          const arr = (res.body.body || []) as any[];
          this.listStatus = arr.map((x) => ({
            code: x.code ?? x.status ?? x.value ?? "",
            name: x.name ?? x.label ?? String(x.code ?? ""),
            color: x.color,
          }));
        } else {
          console.error(
            "Lỗi lấy danh sách trạng thái:",
            res?.responseMessage || res
          );
        }
      },
      error: (error) => console.error("Lỗi kết nối đến server:", error),
    });
  }

  search() {
    this.currentPage = 0; // Reset về page 0 khi search
    this.loadPage(0);
  }

  checkView(view: "ds" | "hc" | "bo" | "ca" | "tl") {
    this.isCheckView = view;
    if (view === "ds") {
      this.loadPage(this.currentPage);
    } else if (view === "hc") {
      this.loadDeadline();
    } else if (view === "bo") {
      this.loadBoard();
    } else if (view === "ca") {
    }
  }

  loadDeadline() {
    const body = { workSpaceId: this.workspaceId };
    this.taskServices.getHC(body).subscribe({
      next: (res) => {
        // res.body: { overdue:[], today:[], thisWeek:[], nextWeek:[] }
        this.tasksHC = (res?.body || {}) as any;
      },
      error: (err) => console.error("Lỗi kết nối đến server:", err),
    });
  }

  loadCalendar() {
    const body = { workSpaceId: this.workspaceId };
    this.taskServices.getBoard(body).subscribe({
      next: (res) => {
        // Extract tasks from response - handle nested structure
        const payload = res?.body?.body ?? res?.body ?? [];
        this.tasks = Array.isArray(payload) ? payload : [];
        this.tasksLine = this.tasks;

        // Refresh calendar if it's currently visible
        if (this.isCheckView === "ca" && this.calendarComponent) {
          setTimeout(() => {
            const api = this.calendarComponent?.getApi();
            if (api) {
              api.refetchEvents();
            }
          }, 100);
        }
      },
      error: (err) => console.error("Lỗi kết nối đến server:", err),
    });
  }

  loadBoard() {
    const body = { workSpaceId: this.workspaceId };
    this.taskServices.getBoard(body).subscribe({
      next: (res: any) => {
        const payload = res?.body?.body ?? res?.body ?? [];

        // Dạng 1: Server trả MẢNG task (đúng như bạn dán)
        if (Array.isArray(payload)) {
          this.tasksBoard = payload.map((t) => ({
            ...t,
            status: String(t.status), // chuẩn hoá kiểu chuỗi để so sánh trong template
            participants: this.generateMockParticipants(), // Add mock participants
          }));
          return; // ✅ xong luôn, KHÔNG động vào listStatus/statusName
        }

        // Dạng 2: Server trả OBJECT theo cột { done:[], review:[], ... }
        if (payload && typeof payload === "object") {
          const flat: any[] = [];
          Object.keys(payload).forEach((colKey) => {
            const raw = payload[colKey];
            const list = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.items)
                ? raw.items
                : [];
            // (tuỳ chọn) nếu bạn không muốn in cảnh báo, xoá dòng warn cũ đi
            // if (!Array.isArray(raw)) { /* bỏ console.warn */ }
            for (const t of list) {
              // KHÔNG sửa trạng thái nếu đã có:
              flat.push({ ...t, status: t?.status ?? String(colKey) });
            }
          });
          this.tasksBoard = flat;
          return;
        }

        // Fallback
        this.tasksBoard = [];
      },
      error: (e) => console.error("getBoard error:", e),
    });
  }

  onDragStart(item: any) {
    debugger;
    const body = { id: item.id };
    console.log("drag start:", item);
  }

  onDropSimple(event: CdkDragDrop<any[]>, targetStatus: string) {
    console.log("drop event:", event); // phải thấy log này khi thả
    const moved = event.item.data as { status: string };
    if (moved && moved.status + "" !== targetStatus + "") {
      moved.status = targetStatus; // chỉ đổi status, không đổi gì khác
      const body = { id: event.item.data.id, status: moved.status };
      console.log("drag start:", event.item.data.id);
      this.taskServices.changeStatus(body).subscribe({
        next: (res) => { },
        error: (err) => console.error("Lỗi kết nối đến server:", err),
      });
    }
  }

  // Dùng cho cdkDropListConnectedTo
  dropListIds(): string[] {
    return this.listStatus.map((s) => "list-" + s.code);
  }

  // // Kéo-thả chỉ đổi status (chưa gọi API)
  // onDropSimple(event: CdkDragDrop<any[]>, targetStatus: string) {
  //   const moved = event.item.data as Task | undefined;
  //   if (!moved) return;
  //   if (moved.status !== targetStatus) {
  //     moved.status = targetStatus; // UI tự lọc sang cột khác nhờ *ngIf
  //   }
  //   // Nếu sau này bạn muốn reorder trong cùng cột ⇒ thêm thuộc tính "order" và cập nhật tại đây.
  // }

  loadPage(page: number): void {
    this.isLoading = true;
    this.taskServices
      .search({
        pageNumber: page,
        pageSize: this.pageSize,
        code: this.stringNullOrEmpty(this.searchForm.get("code")?.value)
          ? { contains: this.searchForm.get("code")?.value }
          : null,
        name: this.stringNullOrEmpty(this.searchForm.get("name")?.value)
          ? { contains: this.searchForm.get("name")?.value }
          : null,
        workSpaceId: this.stringNullOrEmpty(
          this.searchForm.get("workSpaceId")?.value
        )
          ? { equals: this.searchForm.get("workSpaceId")?.value }
          : null,
        userCreate: this.stringNullOrEmpty(
          this.searchForm.get("userCreate")?.value
        )
          ? { equals: this.searchForm.get("userCreate")?.value }
          : null,
        assignedTo: this.stringNullOrEmpty(
          this.searchForm.get("assignedTo")?.value
        )
          ? { equals: this.searchForm.get("assignedTo")?.value }
          : null,
      })
      .subscribe({
        next: (res: any) => {
          this.onSuccess(res?.body?.body);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  customSearchFn(term: string, item: any): boolean {
    const keyword = term.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.phone?.toLowerCase().includes(keyword)
    );
  }

  protected onSuccess(data: any | null): void {
    this.tables = data?.page?.content || [];
    this.totalPages = data?.page?.totalPages || 0;
    this.totalElements = data?.page?.totalElements || 0;
    this.currentPage = data?.page?.currentPage || 0;
  }

  stringNullOrEmpty(value: any): boolean {
    return value !== "" && value !== null && value !== undefined;
  }

  create() {
    const res = this.modalService.open(TaskCreateDialogComponent, {
      size: "lg",
      centered: true,
    });
    res.componentInstance.title = "Thêm mới công việc";
    res.closed.subscribe((_) => this.loadPage(this.currentPage));
  }

  edit(table: any) {
    this.router.navigate(["/pages/category/cong-viec-detail"], {
      queryParams: { code: table.code },
    });
    // hoặc mở modal TaskStatusDialogComponent nếu muốn
  }

  @ViewChild("calendar") calendarComponent?: FullCalendarComponent;
  private seq = 3;
  // tasks: Task[] = [
  //   { id: 1, code: 'T-001', taskName: 'Kickoff Meeting',  status: 'TODO',        color: '#9CA3AF', createDt: '2025-09-15', dueDate: '2025-09-15' },
  //   { id: 2, code: 'T-002', taskName: 'Wireframe',        status: 'IN_PROGRESS', color: '#2563EB', createDt: '2025-09-16', dueDate: '2025-09-18' },
  //   { id: 3, code: 'T-003', taskName: 'API Backend',      status: 'DONE',        color: '#10B981', createDt: '2025-09-14', dueDate: '2025-09-20' },
  // ];

  // ==== Trạng thái editor inline ====
  inlineOpen = false;
  inlineTitle = "";
  inlineDate = ""; // yyyy-MM-dd
  pos = { left: 0, top: 0 }; // vị trí hiển thị ô input

  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev",
      center: "title",
      right: "next",
    },
    editable: true,
    selectable: false,
    locale: "vi",
    height: "auto",
    // Only show tasks with both createDt and dueDate
    events: () => Promise.resolve(this.mapTasksForCalendar(this.tasks)),
    dateClick: (arg: any) => this.openInline(arg),
    eventDrop: (info) => this.onDropResize(info.event),
    eventResize: (info) => this.onDropResize(info.event),
    dayCellDidMount: (arg) => this.addPlusButton(arg),
    eventClick: (info) => this.onEventClick(info),
  };

  // YYYY-MM-DD theo múi giờ local (VN)
  private toLocalYMD(d?: string | Date) {
    if (!d) return "";
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Cộng/trừ ngày theo local và trả về YYYY-MM-DD
  private addDaysLocalYMD(d: string | Date, days: number) {
    const x = new Date(d);
    // chốt về 00:00 local để tránh trôi ngày
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() + days);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  private addOneLocalYMD(d: string | Date) {
    return this.addDaysLocalYMD(d, +1);
  }

  private minusOneLocalYMD(d: string | Date) {
    return this.addDaysLocalYMD(d, -1);
  }

  mapTasks(tasks: Task[]) {
    return tasks.map((t) => {
      const startYMD = this.toLocalYMD(t.dueDate || t.createDt); // ưu tiên ngày hạn
      return {
        id: String(t.id),
        title: t.taskName,
        start: startYMD, // all-day: dùng YYYY-MM-DD (local)
        end: this.addOneLocalYMD(t.dueDate || t.createDt), // end exclusive => +1 ngày (local)
        allDay: true,
        backgroundColor: t.color || "",
        borderColor: t.color || "",
        classNames: [(t.status || "TODO").toLowerCase()],
      };
    });
  }

  // Map tasks for calendar - only show tasks with dueDate
  mapTasksForCalendar(tasks: Task[]) {
    return tasks
      .filter((t) => t.dueDate) // Only tasks with dueDate
      .map((t) => {
        const startYMD = this.toLocalYMD(t.createDt); // Start from dueDate
        const endYMD = this.addOneLocalYMD(t.dueDate); // End is dueDate + 1 (exclusive)
        return {
          id: String(t.id),
          title: t.taskName,
          start: startYMD,
          end: endYMD,
          allDay: true,
          backgroundColor: t.color || "#9CA3AF",
          borderColor: t.color || "#9CA3AF",
          classNames: [(t.status || "TODO").toLowerCase()],
          extendedProps: {
            task: t, // Store full task object for click handler
          },
        };
      });
  }

  // Add plus button to each day cell
  addPlusButton(arg: any) {
    const dayEl = arg.el;
    const dateStr = arg.date.toISOString().split("T")[0]; // yyyy-MM-dd

    // Find the day frame element (where content is rendered)
    const dayFrame = dayEl.querySelector(".fc-daygrid-day-frame");
    if (!dayFrame) return;

    // Create plus button
    const plusBtn = document.createElement("div");
    plusBtn.className = "calendar-plus-btn";
    plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
    plusBtn.title = "Thêm mới nhanh công việc";

    // Click handler
    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openInline({ dateStr, dayEl });
    });

    // Append to day frame (not dayEl)
    dayFrame.appendChild(plusBtn);
  }

  // Handle event click - navigate to detail page
  onEventClick(info: any) {
    info.jsEvent.preventDefault();
    const task = info.event.extendedProps?.task;
    if (task) {
      this.edit(task);
    }
  }

  refetch() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    api.removeAllEvents();
    api.addEventSource(this.mapTasksForCalendar(this.tasks));
  }

  // ===== Inline editor mở khi click vào 1 ngày =====
  openInline(arg: any) {
    this.inlineOpen = true;
    this.inlineTitle = "";
    this.inlineDate = arg.dateStr; // yyyy-MM-dd

    // Lấy bounding box của ô ngày rồi đặt input vào đúng tâm
    const rect: DOMRect = (arg.dayEl as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;

    this.pos.left = centerX;
    this.pos.top = centerY;

    // focus input sau khi render
    setTimeout(() => {
      const el = document.getElementById(
        "inlineTitle"
      ) as HTMLInputElement | null;
      el?.focus();
    });
  }

  private asDateOnly(d: string | Date): Date {
    if (d instanceof Date) return d;
    // d dạng "YYYY-MM-DD"
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  }

  /** Parse "HH:mm" -> {h,m} */
  private parseHM(t?: string | Date | null): { h: number; m: number } {
    if (!t) return { h: 0, m: 0 };
    if (t instanceof Date) return { h: t.getHours(), m: t.getMinutes() };
    // t dạng "HH:mm"
    const [hh, mm] = t.split(":").map(Number);
    return { h: hh || 0, m: mm || 0 };
  }

  private combineDateAndTimeSafe(
    dateOnly: string | Date,
    time?: string | Date | null
  ): Date {
    const d = this.asDateOnly(dateOnly);
    const { h, m } = this.parseHM(time as any);
    const result = new Date(d);
    result.setHours(h, m, 0, 0);
    return result;
  }

  /** Đảm bảo gửi Instant đúng ISO-8601 (Z) cho backend */
  private toInstantISOString(d: Date): string {
    return d.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
  }

  private minusOne(iso: string | Date): string {
    const d = new Date(iso);
    d.setDate(d.getDate() - 1);
    return this.toLocalYMD(d);
  }

  saveInline() {
    const title = this.inlineTitle.trim();
    if (!title) return this.cancelInline();

    if (!this.inlineTitle?.trim()) {
      return;
    }

    // Tạo payload without dueDate
    const data = {
      name: this.inlineTitle,
      allDay: true,
      workSpaceId: this.workspaceId,
      priority: "medium",
      code: "SR-" + new Date().getTime(),
      status: this.listStatus[0]?.code || null, // gán vào cột đầu tiên
    };

    this.isLoading = true;
    this.taskService.insertOrUpdate(data).subscribe({
      next: (res) => {
        if (res.body?.body === true) {
          // Reload calendar tasks to update calendar view
          this.loadCalendar();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
    this.inlineOpen = false;
  }

  cancelInline() {
    this.inlineOpen = false;
  }

  onInlineKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") this.saveInline();
    if (e.key === "Escape") this.cancelInline();
  }

  // Kéo/resize cập nhật ngày
  onDropResize(event: any) {
    // debugger;
    const id = Number(event.id);
    const start = event.startStr.substring(0, 10);
    const due = event.end
      ? this.minusOne(event.endStr.substring(0, 10))
      : start;

    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.dueDate = due;
      const combined = this.combineDateAndTimeSafe(task.dueDate, null); // Date local
      const body = { id: id, dueDate: combined };
      this.taskServices.changeTask(body).subscribe({
        next: (res) => { },
        error: (err) => console.error("Lỗi kết nối đến server:", err),
      });
      this.refetch();
    }
  }

  inlineBoardOpen = false;
  inlineBoardCode: any = null; // mã status của cột đang mở editor, có thể là string/number/null
  inlineBoardTitle = "";
  statusBoard = "";

  isInlineFor(code: any) {
    // So sánh kiểu an toàn (null và 'null' đều coi là một lane)
    const a = code == null ? "null" : String(code);
    const b =
      this.inlineBoardCode == null ? "null" : String(this.inlineBoardCode);
    return this.inlineBoardOpen && a === b;
  }

  openInlineBoard(code: any) {
    this.inlineBoardOpen = true;
    this.inlineBoardCode = code ?? null;
    this.inlineBoardTitle = "";
    setTimeout(() => {
      const id = `boardTitle-${code == null ? "null" : String(code)}`;
      document.getElementById(id)?.focus();
    });
  }

  cancelInlineBoard() {
    this.inlineBoardOpen = false;
    this.inlineBoardTitle = "";
    this.inlineBoardCode = null;
  }

  onInlineBoardKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") this.saveInlineBoard();
    if (e.key === "Escape") this.cancelInlineBoard();
  }

  saveInlineBoard() {
    const title = (this.inlineBoardTitle || "").trim();
    if (!title) return;
    const data = {
      name: title,
      allDay: true,
      workSpaceId: this.workspaceId,
      priority: "medium",
      code: "SR-" + new Date().getTime(),
      status: this.inlineBoardCode,
    };

    this.isLoading = true;
    this.taskService.insertOrUpdate(data).subscribe({
      next: (res) => {
        if (res?.body?.body === true) {
          this.cancelInlineBoard();
          this.reloadTasksBoard(); // tải lại board để thấy task mới
        } else {
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // Gọi API lấy lại tasks cho board
  reloadTasksBoard() {
    const body = { workSpaceId: this.workspaceId };
    this.checkView("bo");
  }
  statusClass(task: any, day: number) {
    // debugger;
    const d = new Date(this.currentYear, this.currentMonth, day).getTime();
    const e = new Date(task.dueDate).getTime();
    const s = new Date(task.createDt).getTime(); // Use createDt for start

    // One day in milliseconds
    const oneDay = 24 * 60 * 60 * 1000;

    if (d >= (s - oneDay) && d <= e) {
      switch (task.priority?.toLowerCase()) {
        case "low":
          return "st-done";
        case "medium":
          return "st-review";
        default:
          return "st-todo";
      }
    }
    return "";
  }

  // Mini Tasks Modal
  showMiniTasksModal = false;
  selectedTask: any = null;
  miniTasks: any[] = [];
  assigneeList: any[] = [
    { name: "Trần Bình" },
    { name: "Phạm Dũng" },
    { name: "Trần Vinh" },
    { name: "Nguyễn An" },
  ];

  // Participants Panel - inline dropdown
  activeParticipantsTaskId: string | null = null;

  openMiniTasksModal(task: any) {
    this.selectedTask = task;
    this.isLoading = true;

    const body = {
      code: task.code
    };

    this.taskService.findById(body).subscribe({
      next: (res: any) => {
        if (res && res.body.responseCode === '200') {
          const responseData = res.body.body;

          // Map listSubTasks to miniTasks format
          this.miniTasks = (responseData.listSubTasks || []).map((subTask: any) => {
            // Find matching status from listStatus by comparing 'no' field
            const matchedStatus = this.listStatus.find(
              (status: any) => status.no === subTask.no
            );

            return {
              id: subTask.id,
              no: subTask.no,
              code: subTask.code,
              title: subTask.taskName,
              taskName: subTask.taskName,
              assigned: subTask.userId,
              dueDate: subTask.dueDate ? new Date(subTask.dueDate) : null,
              status: subTask.status,
              statusName: matchedStatus ? matchedStatus.name : subTask.statusName,
              statusColor: matchedStatus ? matchedStatus.color : null
            };
          });

          // Update selected task with full details
          this.selectedTask = {
            ...task,
            ...responseData.taskDetailDTO,
            countSubtask: responseData.countSubtask,
            countDone: responseData.countDone
          };

          this.showMiniTasksModal = true;
        } else {
          console.error('Error fetching task details:', res.body.responseMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error connecting to server:', error);
        this.isLoading = false;
      }
    });
  }

  closeMiniTasksModal() {
    this.showMiniTasksModal = false;
    this.selectedTask = null;
    this.miniTasks = [];
  }

  toggleStatus(miniTask: any) {
    miniTask.status = miniTask.status === "done" ? "todo" : "done";
  }

  // Kanban Board Helper Methods
  getTasksByStatus(statusCode: string): Task[] {
    return this.tasksBoard.filter(
      (task) => task.status + "" === statusCode + ""
    );
  }

  getPriorityBgColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      low: "#dcfce7",
      medium: "#fef3c7",
      high: "#fee2e2",
    };
    return colorMap[priority?.toLowerCase()] || "#fef3c7";
  }

  getPriorityTextColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      low: "#166534",
      medium: "#ca8a04",
      high: "#dc2626",
    };
    return colorMap[priority?.toLowerCase()] || "#ca8a04";
  }

  getPriorityLabel(priority: string): string {
    const labelMap: { [key: string]: string } = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
    };
    return labelMap[priority?.toLowerCase()] || "Trung bình";
  }

  getInitials(name: string): string {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRemainingParticipants(participants: any[]): string {
    if (participants.length <= 3) return "";
    return participants
      .slice(3)
      .map((p) => p.name)
      .join(", ");
  }

  generateMockParticipants(): any[] {
    const allParticipants = [
      { name: "Thắng Nguyễn", avatar: null },
      { name: "Tấn Sinh", avatar: null },
      { name: "Phạm Dũng", avatar: null },
      { name: "Trần Vinh", avatar: null },
      { name: "Nguyễn An", avatar: null },
    ];

    // Randomly select 1-5 participants
    const count = Math.floor(Math.random() * 5) + 1;
    return allParticipants.slice(0, count);
  }

  // Participants Panel Methods - inline dropdown
  toggleParticipantsPanel(event: Event, task: any) {
    event.stopPropagation();
    if (this.activeParticipantsTaskId === task.id) {
      this.activeParticipantsTaskId = null;
    } else {
      this.activeParticipantsTaskId = task.id;
    }
  }

  isParticipantsPanelOpen(taskId: string): boolean {
    return this.activeParticipantsTaskId === taskId;
  }




}
