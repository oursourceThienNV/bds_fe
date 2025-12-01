// company.component.ts
import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
import { COMMON_STATUS, ROLE, ROLE_WORKSPACE , COMMMON_CODE } from "../Contants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import { CompanyService } from "src/app/core/services/services-app/company.service";
import { ApiUrl } from "src/app/shared/constant/ApiUrl.constant";
import { GroupTeamService } from "src/app/core/services/services-app/group-team.service";
import { CustomerDialogComponent } from "./customer-dialog.component";
import { CommonCodeServices } from "../../../core/services/services-app/common-code.service";
import { CustomerService } from "../../../core/services/services-app/customer.service";
import { LocationServices } from "../../../core/services/services-app/location.service";
import { Router } from "@angular/router";
import { UserProfileService } from "../../../core/services/user.service";
import { format } from "date-fns";
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ViewChildren, QueryList } from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';





interface Relationship {
  customer_id: number;
  label: string;
  code: string;
  hoten: string;
}
interface MediaItem {
  id: string;
  file_name: string;
  url: string;
}
interface ColumnDef {
  key: string;
  label: string;
}
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html'
})
export class CustomerComponent implements OnInit {
  @ViewChild('popupMenu') popupMenu!: ElementRef;
  isOn = false;
  private _ignoreNextDocClick = false;
  ROLE = ROLE;
  role: any;
  tables: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  page = new Page();
  COMMON_STATUS = COMMON_STATUS;
  isLoading: boolean = false;
  listCompany: any[] = [];
  url: any;
  isCheckView: boolean = true;
  selectedCount: number = 0;
  allSelected: boolean = false;
  showSelectMenu: boolean = false;

// chức năng tìm kiếm


  // chọn cột hiển thị
  isShowColumnMenu = false;
  presetName = '';
  presetNames: string[] = [];
  tempColumns: string[] = [];
  // mở/đóng menu chọn cột hiển thị
  openColumnMenu() {
     this.tempColumns = [...this.displayedColumns];
    this.isShowColumnMenu = !this.isShowColumnMenu;
    if (this.isShowColumnMenu) {
      this.loadPresetList();
    }
  }
  closeColumnMenu() {
    this.isShowColumnMenu = false;
  }
  onClickOutside(event: MouseEvent) {
    const clickTarget = event.target as HTMLElement;
    const insidePopup = this.popupMenu?.nativeElement.contains(clickTarget);

    if (!insidePopup) {
      this.closeColumnMenu();
    }
  }
  // list view
  isBulkMenuVisible: boolean = false;
  onToggleBulkMenu(event: Event) {
    event.stopPropagation();
    this.isBulkMenuVisible = !this.isBulkMenuVisible;
  }


    onMenuSelectAll() {
      this.allSelected = true;
      this.tables.forEach(row => row.selected = true);

      // Cập nhật lại số lượng đã chọn
      this.selectedCount = this.tables.length;

      // Đóng menu sau khi chọn
      this.isBulkMenuVisible = false;
    }
    onMenuSelectStarred() {
    this.tables.forEach(row => {

      row.selected = !!row.favorite;
    });

    this.updateSelectionState(); // Cập nhật lại số lượng
    this.isBulkMenuVisible = false; // Đóng menu
  }
    onMenuSelectUnstarred() {
    this.tables.forEach(row => {

      row.selected = !row.favorite;
    });

    this.updateSelectionState(); // Cập nhật lại số lượng
    this.isBulkMenuVisible = false; // Đóng menu
  }
  updateSelectionState() {
    // Đếm số dòng đang được chọn
    this.selectedCount = this.tables.filter(t => t.selected).length;

    // Kiểm tra xem có phải chọn tất cả không
    this.allSelected = this.tables.length > 0 && this.selectedCount === this.tables.length;
  }
  onMenuDeselectAll() {
    this.allSelected = false;
    this.tables.forEach(row => row.selected = false);

    // Reset số lượng
    this.selectedCount = 0;

    // Đóng menu
    this.isBulkMenuVisible = false;
  }


  // Hiển thị chế độ xem
  currentPresetName: string = '';
  visiblePresets: any[] = [];

  // Hàm xử lý khi click vào nút trên thanh

onSelectPreset(name: string) {
    // Logic HỦY CHỌN (Click lại vào nút đang sáng)
    if (this.currentPresetName === name) {
      console.log('Đã hủy chọn chế độ:', name);

      this.currentPresetName = '';
      localStorage.removeItem('currentActivePreset');

      // SỬA: Quay về mặc định (khoảng 5-6 cột cơ bản) thay vì hiện tất cả
      if (this.displayedColumnsDefault && this.displayedColumnsDefault.length > 0) {
          this.displayedColumns = [...this.displayedColumnsDefault];
      } else {
          // Fallback nếu chưa khai báo default
          this.displayedColumns = ['code', 'hoTen', 'sdt', 'actions'];
      }

      return;
    }

    // Logic CHỌN MỚI
    this.loadPreset(name);
    this.addToVisibleBar(name);

    this.currentPresetName = name;
    localStorage.setItem('currentActivePreset', name);
  }



  // 1. Hàm lưu danh sách 3 nút vào bộ nhớ trình duyệt
    saveVisibleBarToStorage() {
      localStorage.setItem('saved_visible_bar', JSON.stringify(this.visiblePresets));
    }
    // 2. Hàm tải lại danh sách khi vào trang
    loadVisibleBarFromStorage() {
      const data = localStorage.getItem('saved_visible_bar');
      if (data) {
        const cachedList = JSON.parse(data);

        // --- LỌC DỮ LIỆU: Chỉ lấy những nút mà dữ liệu gốc (preset_...) vẫn còn ---
        this.visiblePresets = cachedList.filter((p: any) => {
          // Kiểm tra xem key 'preset_Tên' có tồn tại trong storage không
          return localStorage.getItem('preset_' + p.name) !== null;
        });

        // Nếu sau khi lọc mà danh sách thay đổi (tức là có nút rác), cập nhật lại storage luôn
        if (this.visiblePresets.length !== cachedList.length) {
          this.saveVisibleBarToStorage();
        }
      }
    }


  // Logic xử lý hàng đợi 3 nút
    addToVisibleBar(name: string) {
      if (!name || name.trim() === '') return;
      const isExist = this.visiblePresets.some(p => p.name === name);
      if (isExist) return;

      if (this.visiblePresets.length >= 3) {
        this.visiblePresets.shift();
      }

      this.visiblePresets.push({ name: name });


      this.saveVisibleBarToStorage();
    }


  // lưu chế độ xem
savePreset() {
    // 1. Nếu đang không nhập tên, thử lấy tên của chế độ đang active (để hỗ trợ tính năng Cập nhật)
    if (!this.presetName.trim() && this.currentPresetName) {
        this.presetName = this.currentPresetName;
    }

    if (!this.presetName.trim()) {
      alert('Vui lòng nhập tên chế độ xem!');
      return;
    }

    // 2. Kiểm tra xem tên này đã tồn tại chưa (Logic ghi đè)
    const key = `preset_${this.presetName}`;
    const isUpdate = localStorage.getItem(key) !== null;

    if (isUpdate) {
        // Nếu tên nhập vào trùng với tên đang active -> Update ngầm (hoặc hỏi confirm nhẹ)
        // Nếu tên nhập vào trùng với tên khác -> Cảnh báo
        const confirmMsg = `Chế độ "${this.presetName}" đã tồn tại. Bạn có muốn cập nhật cột mới cho nó không?`;
        if (!confirm(confirmMsg)) return;
    }

    // 3. Lưu danh sách cột hiện tại vào LocalStorage
    // LƯU Ý: Biến this.displayedColumns lúc này phải chứa cột ID bạn vừa tích
    localStorage.setItem(key, JSON.stringify(this.displayedColumns));

    // 4. Cập nhật trạng thái
    this.currentPresetName = this.presetName;
    localStorage.setItem('currentActivePreset', this.presetName);

    // 5. Làm mới giao diện
    this.loadPresetList();
    this.addToVisibleBar(this.presetName);

    alert('Đã lưu chế độ xem thành công!');
    this.presetName = ''; // Reset ô nhập
  }

  // Nạp danh sách preset từ localStorage
  loadPresetList() {
    this.presetNames = Object.keys(localStorage)
      .filter(k => k.startsWith('preset_'))
      .map(k => k.replace('preset_', ''));
  }

  // Chọn preset có sẵn
loadPreset(name: string) {
  if (!name) return;
  const preset = localStorage.getItem(`preset_${name}`);
  if (preset) {
    this.displayedColumns = JSON.parse(preset);


    this.tempColumns = [...this.displayedColumns];
    // -----------------------------

    this.currentPresetName = name;
    localStorage.setItem('currentActivePreset', name);
    this.addToVisibleBar(name);
    this.applyColumns();
  }
}

deletePreset(name: string) {
    if (confirm(`Bạn muốn xóa chế độ "${name}"?`)) {
      // 1. Xóa dữ liệu gốc trong Storage
      localStorage.removeItem(`preset_${name}`);

      // 2. Load lại list trong modal
      this.loadPresetList();

      // 3. Xử lý xóa nút hiển thị trên thanh (Visible Bar)
      const index = this.visiblePresets.findIndex(p => p.name === name);
      if (index !== -1) {
        this.visiblePresets.splice(index, 1);

        //  !!! QUAN TRỌNG: THÊM DÒNG NÀY ĐỂ LƯU TRẠNG THÁI MỚI VÀO STORAGE !!!
        this.saveVisibleBarToStorage();
      }

      // 4. Nếu đang active chế độ đó thì reset
      if (this.currentPresetName === name) {
        this.currentPresetName = '';
        localStorage.removeItem('currentActivePreset'); // Xóa luôn key active trong storage cho sạch
      }
    }
  }























  // hiển thị danh sách, kaban, celadar
  currentView: 'list' | 'kaban' | 'calendar' = 'list';
// danh sách
  showDeleteModal = false;
  deleteMessage = '';
  // 🗑️ Xóa
  // Mở modal xác nhận xóa
  deleteSelected(): void {
    const selectedCount = this.tables.filter(t => t.selected).length;
    if (selectedCount === 0) return;

    this.deleteMessage = `Bạn chắc chắn muốn xóa ${selectedCount} khách hàng?`;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    this.tables = this.tables.filter(t => !t.selected);
    this.showDeleteModal = false;
    this.updateSelectedCount(); // cập nhật lại toolbar
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }


  /** calendar **/
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  daysInMonth: Array<{ date: Date; isToday: boolean }> = [];


  // demo event mẫu (bạn có thể sau này load từ DB)
  // events: { date: string; title: string }[] = [
  //   { date: '2025-09-09', title: 'Gửi lời chúc thành lập nhóm B' },
  //   { date: '2025-09-23', title: 'Sinh nhật khách hàng A' },
  // ];

getListCalenlendar() {
  const body = {};
  this.customerService.getCalendar(body).subscribe({
    next: (res: any) => {
      const apiData = res.body?.body || [];

      this.events = apiData.map((item: any) => {
        return {
          id: item.id,
          title: item.tenSuKien,
          date: item.ngayBatDau ? item.ngayBatDau.split('T')[0] : '',

          type: item.loaiSuKien,
          start: item.ngayBatDau,
          end: item.ngayKetThuc,
          description: item.mota,
          group: item.group || item.groupId || item.nhomKh,
          remindBefore: item.remindBefore || [],
          nhacLai: item.nhacLai || 'once',
          dsNhan: item.dsNhan || ''
        };
      });

      this.generateCalendar(this.currentYear, this.currentMonth);
    },
    error: (err) => console.error("Lỗi tải lịch:", err)
  });
}

  generateCalendar(year: number, month: number): void {

    this.daysInMonth = [];
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      this.daysInMonth.push({ date, isToday });
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth)
      .toLocaleString('vi-VN', { month: 'long' });
  }


  getEventsForDate(dayDate: Date): any[] {

    const current = new Date(dayDate);
    current.setHours(0, 0, 0, 0);
    const currentTime = current.getTime();

    return this.events.filter(event => {

      const startRaw = event.ngayBatDau || event.start;
      if (!startRaw) return false;

      const start = new Date(startRaw);
      start.setHours(0, 0, 0, 0); // Reset về 0h00

      return currentTime === start.getTime();

    }).sort((a, b) => a.id - b.id);
  }

  // quản lí popup thêm sửa sự kiện
  showEventPopup = false;
  isSubmitted: boolean = false;
  events: any[] = [];
  isEditMode: boolean = false;
  newEvent = {
      id: null,
      tenSuKien: '',
      loaiSuKien: '',
      nhacLai: 'once',
      ngayBatDau: new Date(), // Mặc định là ngày hôm nay (Date Object)
      ngayKetThuc: null,
      gioBatDau: '08:00',
      gioKetThuc: '17:00',
      mota: '',
      remindBefore: [],
      nhacTruoc: [],
      group: '',
      selectedCustomers: [] as any[],
      dsNhan: ''
    };

openAddEvent(date: Date | null) {
    this.isEditMode = false;


    this.resetEventForm();


    if (date) {

      this.newEvent.ngayBatDau = new Date(date);
      this.newEvent.ngayKetThuc = new Date(date);
      this.newEvent.gioBatDau = '08:00';
      this.newEvent.gioKetThuc = '09:00';
    }

    this.showEventPopup = true;
  }

// Hàm mở popup SỬA
openEventDetail(event: any) {
  console.log('>>> CHECK DỮ LIỆU MỞ LẠI:', event);
  this.isEditMode = true;
  this.resetEventForm();

  const safeDate = (input: any) => {
    if (!input) return null;
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  };
  const rawStart = event.ngayBatDau || event.start || event.startDate;
  let finalStart = safeDate(rawStart);
  if (!finalStart) finalStart = new Date();
  const rawEnd = event.ngayKetThuc || event.end || event.endDate;
  let finalEnd = safeDate(rawEnd);
  if (!finalEnd) finalEnd = finalStart;


  let restoredCustomers: any[] = [];
  if (event.listNguoiNhan && Array.isArray(event.listNguoiNhan)) {
     restoredCustomers = event.listNguoiNhan;
  } else if (event.dsNhan && typeof event.dsNhan === 'string') {
     const names = event.dsNhan.split(',');
     restoredCustomers = names.map((name: string, index: number) => ({
         id: -index, code: '', name: name.trim(), selected: true
     })).filter((c: any) => c.name !== "");
  }

let finalGroupId = null;
    this.selectedGroupName = ''; // Reset tên trước khi tìm

    // 1. Lấy ID nhóm từ dữ liệu sự kiện
    // Kiểm tra kỹ các trường có thể chứa thông tin nhóm
    const rawGroup = event.group || event.groupId || event.nhomKh;

    if (rawGroup) {
        // Trường hợp A: API trả về Object {id: 1, name: 'VIP'} -> Lấy luôn tên
        if (typeof rawGroup === 'object' && rawGroup.name) {
            finalGroupId = rawGroup.id;
            this.selectedGroupName = rawGroup.name;
        }
        // Trường hợp B: API trả về số ID (ví dụ: 105) -> Phải tìm tên trong danh sách
        else {
            finalGroupId = rawGroup.id || rawGroup; // Lấy ID

            // Tìm trong danh sách nhóm đã tải (listGroupSelected)
            const foundGroup = this.listGroupSelected.find((g: any) => g.id == finalGroupId);

            if (foundGroup) {
                this.selectedGroupName = foundGroup.name; // Tìm thấy -> Gán tên
            } else {
                // Không tìm thấy (do chưa load kịp list hoặc ID cũ bị xóa) -> Hiện tạm ID
                this.selectedGroupName = `Nhóm #${finalGroupId}`;

                // Mẹo: Nếu list rỗng, gọi lại API load nhóm để cập nhật tên sau đó
                if (this.listGroupSelected.length === 0) {
                   this.loadGroupsFromApi();
                }
            }
        }
    }


  // --- MAP VÀO FORM ---
  this.newEvent = {
    id: event.id,
    tenSuKien: event.tenSuKien || event.title || '',
    loaiSuKien: event.loaiSuKien || event.type || '',
    ngayBatDau: finalStart,
    ngayKetThuc: finalEnd,
    gioBatDau: event.gioBatDau || '08:00',
    gioKetThuc: event.gioKetThuc || '09:00',
    mota: event.moTa || event.description || '',
    nhacTruoc: Array.isArray(event.nhacTruoc) ? [...event.nhacTruoc] : [],
    nhacLai: event.nhacLai || 'once',
    remindBefore: event.remindBefore || [],

    group: finalGroupId, // Gán ID vào biến

    dsNhan: event.dsNhan || '',
    selectedCustomers: restoredCustomers
  };


  this.showEventPopup = true;
}

  closeEventPopup() {
    this.showEventPopup = false;
  }


// --- 1. HÀM RESET FORM (Chạy khi mở popup hoặc sau khi lưu) ---
resetEventForm() {
  this.isSubmitted = false;


  this.selectedGroupName = '';

  this.newEvent = {
    id: null,
    tenSuKien: '',
    loaiSuKien: '',
    nhacLai: 'once',
    ngayBatDau: new Date(),
    ngayKetThuc: null,
    gioBatDau: '08:00',
    gioKetThuc: '17:00',
    mota: '',
    remindBefore: [],
    nhacTruoc: [],


    group: '',

    selectedCustomers: [],
    dsNhan: ''
  };
}

// Hàm ghép Ngày + Giờ chuẩn ISO (YYYY-MM-DD)

  combineToGlobalISO(dateInput: any, timeString: string): string {
    // 1. Validate
    if (!dateInput) return "";

    const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    // 2. Xử lý giờ phút
    const time = timeString || "00:00";
    const [hh, mm] = time.split(':').map(Number);

    // 3. Lấy ngày tháng năm theo giờ MÁY TÍNH (Local Time)

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const hour = ('0' + hh).slice(-2);
    const min = ('0' + mm).slice(-2);
    const sec = '00'; // Mặc định giây là 00

    // 4. Ghép chuỗi thủ công để giữ nguyên giờ + thêm chữ Z
    return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
  }
saveEvent() {
  this.isSubmitted = true;

  // 1. VALIDATE
  if (!this.newEvent.tenSuKien) {
    alert('Vui lòng nhập Tiêu đề!');
    return;
  }
  if (!this.newEvent.loaiSuKien) {
    alert('Vui lòng chọn Loại sự kiện!');
    return;
  }
  if (!this.newEvent.ngayBatDau) {
    alert('Vui lòng chọn Ngày bắt đầu!');
    return;
  }

  // 2. XỬ LÝ NGÀY THÁNG
  const startString = this.combineToGlobalISO(this.newEvent.ngayBatDau, this.newEvent.gioBatDau);
  let endString = null;
  if (this.newEvent.ngayKetThuc) {
    endString = this.combineToGlobalISO(this.newEvent.ngayKetThuc, this.newEvent.gioKetThuc);
    if (endString < startString) {
      alert('Ngày kết thúc không được nhỏ hơn ngày bắt đầu!');
      return;
    }
  }

  // Chuyển mảng object [{name: 'A'}, {name: 'B'}] thành chuỗi "A, B"
  let dsNhanString = "";
  if (this.newEvent.selectedCustomers && this.newEvent.selectedCustomers.length > 0) {
      dsNhanString = this.newEvent.selectedCustomers
          .map((c: any) => c.name) // Lấy tên
          .join(', ');             // Nối bằng dấu phẩy
  }

  // 4. TẠO PAYLOAD
  const payload = {
      id: this.newEvent.id,
      tenSuKien: this.newEvent.tenSuKien,
      loaiSuKien: this.newEvent.loaiSuKien,
      nhacLai: this.newEvent.nhacLai || 'once',

      ngayBatDau: startString,
      ngayKetThuc: endString,

      mota: this.newEvent.mota || "",
      group: this.newEvent.group || null,

      // [SỬA TẠI ĐÂY] Gán chuỗi tên đã xử lý vào
      dsNhan: dsNhanString,

      // Giữ nguyên các trường khác
      remindBefore: this.newEvent.nhacTruoc || [],
      nhacTruoc: JSON.stringify(this.newEvent.nhacTruoc || [])
  };

  console.log("🔥 Payload gửi đii :", payload);

  // 5. GỌI API
  this.customerService.createCalendar(payload).subscribe({
      next: (res) => {
          const msg = this.newEvent.id ? "Cập nhật thành công!" : "Thêm mới thành công!";
          alert(msg);

          this.showEventPopup = false;
          this.resetEventForm();
          this.getListCalenlendar();
      },
      error: (err) => {
          console.error("Lỗi API:", err);
          const svMsg = err.error?.message || "Vui lòng kiểm tra lại dữ liệu";
          alert("Lỗi: " + svMsg);
      }
  });
}


  showSelectCustomerPopup = false;
  selectedCustomers: any[] = [];
  customerList: any[] = []
  popupCustomerSearchText: string = '';

openSelectCustomerPopup() {
    this.showSelectCustomerPopup = true;
    this.popupCustomerSearchText = '';
    this.loadCustomerListForPopup();
  }

  closeSelectCustomerPopup() {
    this.showSelectCustomerPopup = false;
  }

loadCustomerListForPopup() {
  const body = {
    workSpaceId: +this.workSpaceId // Dấu + để ép kiểu thành số (Integer)
  };
  console.log("🚀 Đang gửi body:", body);

  this.customerService.getAllCustomersInWorkspace(body).subscribe({
    next: (res: any) => {
       // ... xử lý dữ liệu như cũ ...
       const rawData = res.body;
       let dataArray = [];

       // Logic map dữ liệu cũ của bạn giữ nguyên
       if (Array.isArray(rawData)) {
          dataArray = rawData;
       } else if (rawData && Array.isArray(rawData.body)) {
          dataArray = rawData.body;
       }

       this.customerList = dataArray.map((c: any) => ({ ...c, selected: false }));
    },
    error: (err) => console.error("❌ Lỗi API:", err)
  });
}

  searchCustomerPopup() {
    this.loadCustomerListForPopup();
  }

  toggleCustomerSelection(customer: any) {
    customer.selected = !customer.selected;
  }

addSelectedCustomers() {

  const chosen = this.customerList.filter(c => c.selected);

  if (chosen.length === 0) {
    alert("Vui lòng chọn ít nhất 1 khách hàng!");
    return;
  }


  if (!this.newEvent.selectedCustomers) {
    this.newEvent.selectedCustomers = [];
  }

  // 3. Đẩy vào mảng (Có kiểm tra trùng lặp)
  chosen.forEach(c => {
    // Kiểm tra xem khách này đã có trong danh sách chưa (tránh thêm 2 lần)
    const exists = this.newEvent.selectedCustomers.find((x: any) => x.id === c.id);

    if (!exists) {
      this.newEvent.selectedCustomers.push({
        id: c.id,
        code: c.code,
        // [QUAN TRỌNG] Lấy cả 2 trường tên để dự phòng
        name: c.hoTen || c.name
      });
    }
  });

  // 4. Đóng popup
  this.showSelectCustomerPopup = false;
}
// Hàm chọn tất cả trong Popup
  toggleAllInPopup(event: any) {
    const isChecked = event.target.checked;
    this.customerList.forEach(c => c.selected = isChecked);
  }


  // Hàm bỏ chọn tất cả (Nút Bỏ chọn)
  clearSelectionCustomer() {
    this.customerList.forEach(c => c.selected = false);
    // Reset cả checkbox header nếu có thể (cần ViewChild nếu muốn làm kỹ)
  }
  removeCustomerChip(index: number) {
    if(this.newEvent.selectedCustomers) {
      this.newEvent.selectedCustomers.splice(index, 1)
    }
  }
  removeAllCustomers() {
    this.newEvent.selectedCustomers =[];
    this.newEvent.dsNhan =''
  }



  showGroupManagerPopup: boolean = false;
  customerGroups: any[] = [];
  popupSearchText: string = "";

  openGroupManagerPopup() {
    this.showGroupManagerPopup = true;
    this.loadGroupsFromApi();
  }

  closeGroupManagerPopup() {
    this.showGroupManagerPopup = false;
  }

  searchPopup() {
    this.loadGroupsFromApi();
  }


loadGroupsFromApi() {
  if (!this.workSpaceId) return;

  const body = {
    workSpaceId: +this.workSpaceId,
    type: 'NK' //
  };

  // 2. Gọi API
  this.customerService.getCustomerGroups(body).subscribe({
    next: (res: any) => {

      const data = res.body?.body || res.body || [];

      console.log("Danh sách Nhóm KH:", data);

      this.listGroupSelected = data;


      this.customerGroups = data.map((g: any) => ({
        ...g,
        selected: false
      }));
    },
    error: (err) => {
      console.error("❌ Lỗi tải nhóm khách hàng:", err);
    }
  });
}

 // Hàm chọn nhóm (Single Select)
  selectGroup(group: any) {
    this.customerGroups.forEach(g => g.selected = false);
    group.selected = true;
  }

  listGroupSelected: any[] = [];
  selectedGroupName: string = '';


saveGroups() {
  const selectedGroup = this.customerGroups.find(g => g.selected);
  if (selectedGroup) {
    this.newEvent.group = selectedGroup.id;
    this.selectedGroupName = selectedGroup.name;
    this.closeGroupManagerPopup();
  } else {
    alert("Vui lòng chọn một nhóm khách hàng!");
  }

}

expandGroups() {
    alert('🟦 Mở rộng xem chi tiết nhóm khách hàng!');
  }


  // điều hướng popup mở rộng chi tiết nhóm
  showGroupDetailPopup = false;
  selectedGroup: any = null;

loadGroupMembers() {
    // 1. Kiểm tra an toàn
    if (!this.selectedGroup || !this.selectedGroup.id) {
      console.warn("Chưa chọn nhóm nào để tải thành viên!");
      return;
    }

    // 2. Tạo Body Filter (Quan trọng)
    // Cấu trúc này phải khớp với quy tắc lọc của Backend bạn (thường là { equals: ... })
    const bodySearch = {
      pageNumber: 0,
      pageSize: 1000, // Lấy số lượng lớn để hiện hết trong popup

      // Lọc theo Workspace
      workSpaceId: { equals: +this.workSpaceId },

      // Lọc theo Nhóm (Thay 'nhomKh' bằng tên trường chính xác của BE nếu cần)
      nhomKh: { equals: this.selectedGroup.id }
    };

    console.log("🔍 Đang tải thành viên nhóm với body:", bodySearch);

    // 3. Gọi API Search
    this.customerService.search(bodySearch).subscribe({
      next: (res: any) => {
        // 4. Lấy dữ liệu từ Response
        // (Kiểm tra kỹ cấu trúc trả về của BE: body.page.content hay body trực tiếp)
        const data = res.body?.body?.page?.content || res.body?.body || [];

        console.log(`✅ Tải được ${data.length} thành viên.`);

        // 5. Gán vào biến hiển thị
        this.groupCustomers = data.map((c: any) => ({
           ...c,
           selected: false // Reset checkbox xóa
        }));
      },
      error: (err) => {
        console.error("❌ Lỗi tải thành viên nhóm:", err);
        this.groupCustomers = []; // Reset về rỗng nếu lỗi
      }
    });
  }

openGroupDetailPopup() {

    const checkedGroup = this.customerGroups.find(g => g.selected);

    if (!checkedGroup) {
      alert("Vui lòng tích chọn một nhóm để xem chi tiết!");
      return;
    }


    this.selectedGroup = checkedGroup;


    this.loadGroupMembers();

    // 4. Chuyển đổi Popup
    this.showGroupManagerPopup = false;
    this.showGroupDetailPopup = true;
  }
  closeGroupDetailPopup() {
    this.showGroupDetailPopup = false;
  }

groupCustomers: any[] = [];


  deleteGroup() {
    if (confirm(`Bạn có chắc muốn xóa nhóm "${this.selectedGroup?.name}" không?`)) {
      alert('Đã xóa nhóm!');
      this.closeGroupDetailPopup();
    }
  }

  renameGroup() {
    const newName = prompt('Nhập tên nhóm mới:', this.selectedGroup?.name);
    if (newName && newName.trim()) {
      this.selectedGroup.name = newName.trim();
      alert('✅ Đã đổi tên nhóm!');
    }
  }

  exportCSV() {
    alert('📄 Xuất CSV thành công!');
  }

  deleteCustomerInGroup(cus: any) {
    if (confirm(`Xóa khách hàng ${cus.name}?`)) {
      this.groupCustomers = this.groupCustomers.filter(c => c.id !== cus.id);
    }
  }


  // popup dấu cộng nhóm quản lí khách hàng
  showAddCustomerToGroupPopup = false;
  availableCustomers = [
    { id: 101, code: 'KH003', name: 'Nguyễn Văn C', phone: '0978000003', email: 'a@gmail.com', selected: false },
    { id: 102, code: 'KH004', name: 'Nguyễn Văn D', phone: '0978000004', email: 'a@gmail.com', selected: false },
    { id: 103, code: 'KH005', name: 'Nguyễn Văn E', phone: '0978000005', email: 'a@gmail.com', selected: false },
  ];

  openAddCustomerToGroupPopup() {
    this.showAddCustomerToGroupPopup = true;
  }

  closeAddCustomerToGroupPopup() {
    this.showAddCustomerToGroupPopup = false;
  }

  addSelectedCustomersToGroup() {
    const selected = this.availableCustomers.filter(c => c.selected);
    if (selected.length === 0) {
      alert(' Vui lòng chọn ít nhất 1 khách hàng!');
      return;
    }

    // Thêm vào danh sách groupCustomers hiện tại
    this.groupCustomers.push(...selected.map(c => ({ ...c, selected: false })));
    this.showAddCustomerToGroupPopup = false;
    alert(`✅ Đã thêm ${selected.length} khách hàng vào nhóm "${this.selectedGroup?.name}"!`);
  }

  clearSelection() {
    this.availableCustomers.forEach(c => (c.selected = false));
  }


  constructor(

    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonCodeServices: CommonCodeServices,
    private companyService: CompanyService,
    private customerService: CustomerService,
    private locationService: LocationServices,
    private router: Router,
    private userService: UserProfileService,
    private eRef: ElementRef,
    private api: ApiUrl

  ) { }

addCustomer() {
  const res = this.modalService.open(CustomerDialogComponent, { size: 'lg', centered: true });

  res.closed.subscribe(dataFromModal => {
    // Kiểm tra kết quả trả về
    if (dataFromModal && dataFromModal.result === 'complete') {

      // --- BẮT BUỘC THÊM DÒNG NÀY ---
      console.log('Xóa cache để tải dữ liệu mới...');
      this.pageCache.clear(); // Xóa sạch bộ nhớ đệm cũ đi

      // Sau đó mới tải lại trang đầu tiên
      this.currentPage = 0;
      this.loadPage(0);
    }
  });
}

  setView(view: 'list' | 'kaban' | 'calendar') {
    this.currentView = view;
    this.closeColumnMenu();

    if (view === 'kaban') {
      this.listAllCustomer();   // luôn load từ DB
    }


    if (view === 'calendar') {
      debugger;
      this.getListCalenlendar();
    }
  }



  /** kaban **/

  kanbanColumns: { key: string; title: string; items: any[]; color?: string }[] = [];

  @ViewChildren('dropListRef') dropListRefsQuery!: QueryList<CdkDropList>;

  get dropListRefs() {
    return this.dropListRefsQuery.toArray();
  }



  private buildKanbanColumns() {
    // Get TTMH items from listCommon
    const ttmhItems = this.listCommon?.filter((item: any) => item.type === 'TTMH') || [];

    // Build columns from listCommon data
    this.kanbanColumns = ttmhItems.map((item: any) => {
      // Filter customers by matching tinhTrangMuaHang with listCommon code
      const customers = this.listCustomer.filter((cus: any) =>
        cus.tinhTrangMuaHang === item.code
      );

      return {
        key: item.code,
        title: item.name,
        items: customers,
        color: item.color || this.getRandomColor()
      };
    });

    // Add a column for customers without status (optional)
    const unclassified = this.listCustomer.filter((cus: any) => {
      const hasMatch = ttmhItems.some((item: any) => item.code === cus.tinhTrangMuaHang);
      return !cus.tinhTrangMuaHang || !hasMatch;
    });

    if (unclassified.length > 0) {
      this.kanbanColumns.push({
        key: '',
        title: 'Không xác định',
        items: unclassified,
        color: '#EFEFEF'
      });
    }
  }

dropKanban(event: CdkDragDrop<any[]>, column: any) {
    const prev = event.previousContainer.data;
    const curr = event.container.data;

    if (event.previousContainer === event.container) {
      moveItemInArray(curr, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(prev, curr, event.previousIndex, event.currentIndex);

      const moved = curr[event.currentIndex];

      // Update tinhTrangMuaHang with the column code
      moved.tinhTrangMuaHang = column.key;

      // Format payload to match API requirements (same as editBox)
      const payload = {
        id: moved.id,
        hoTen: moved.hoTen || '',
        sdt: moved.sdt || '',
        pho: moved.pho || '',
        tinh: moved.tinh || '',
        huyen: moved.huyen || '',
        xa: moved.xa || '',
        listMqh: moved.listMqh || '',
        sanPhamDichVu: moved.sanPhamDichVu || '',
        nhomKh: moved.nhomKh || '',
        yeuCau: moved.yeuCau || '',
        gioiTinh: moved.gioiTinh || '',
        cccd: moved.cccd || null,
        ngaySinh: moved.ngaySinh || null,
        nganhNghe: moved.nganhNghe || '',
        thuNhap: moved.thuNhap || '',
        tinhTrangMuaHang: moved.tinhTrangMuaHang,
        nhuCau: moved.nhuCau || '',
        soThich: moved.soThich || '',
        moiQuanTam: moved.moiQuanTam || '',
        sanPhamTungMua: moved.sanPhamTungMua || '',
        kenhLienHe: moved.kenhLienHe || '',
        ngayDongPhiGanNhat: moved.ngayDongPhiGanNhat || null,
        ngayDongPhiKeTiep: moved.ngayDongPhiKeTiep || null,
        tongDoanhThu: moved.tongDoanhThu || null,
        doanhThuGanNhat: moved.doanhThuGanNhat || null,
        danhSachGapMat: moved.danhSachGapMat || '[null]',
        nguoiPhuTrach: moved.nguoiPhuTrach || null,
        nhanVienTuVan: moved.nhanVienTuVan || null,
        nguon: moved.nguon || '',
        trangThaiCskh: moved.trangThaiCskh || '',
        chiPhiCskh: moved.chiPhiCskh || '',
        tinhTrangCskh: moved.tinhTrangCskh || '',
        soTienHienTai: moved.soTienHienTai || null,
        tongTienCskh: moved.tongTienCskh || null,
        tinhTrangHonNhan: moved.tinhTrangHonNhan || '',
        email: moved.email || '',
        listFile: moved.listFile || [],
        workSpaceId: moved.workSpaceId || this.workSpaceId,
        meets: moved.meets || [null],
        relationshipList: moved.relationshipList || [{ label: '', customerId: null }]
      };

      console.log('🔥 Kanban drop payload:', payload);

      this.customerService.insertOrUpdate(payload).subscribe({
        next: () => {
          console.log('✅ Đã cập nhật trạng thái:', moved.hoTen, '->', column.title);
        },
        error: (err) => {
          console.error('❌ Lỗi API không lưu được:', err);
          console.error('Error details:', err.error);
          // Rollback on error - move back to original position
          transferArrayItem(curr, prev, event.currentIndex, event.previousIndex);
        }
      });
    }
  }

  // Removed: customersByStatus - now using listCommon data dynamically

  // Màu nền cho từng nhóm
  getStatusHeaderColor(code: string) {
    const column = this.kanbanColumns.find(col => col.key === code);
    if (column && column.color) {
      // Lighten the color for header background
      return this.lightenColor(column.color, 0.7);
    }
    return '#EFEFEF';
  }

  // Helper to lighten color
  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }


  getStatusBadgeColor(code: string) {
    const column = this.kanbanColumns.find(col => col.key === code);
    if (column && column.color) {
      // Lighten the color for badge background
      return this.lightenColor(column.color, 0.5);
    }
    return '#E0E0E0';
  }

  toggleFavorite(cus: any, event: MouseEvent) {
    event.stopPropagation();
    cus.favorite = !cus.favorite;

    this.customerService.insertOrUpdate(cus).subscribe();
  }

  // Get status name from code for display
  getStatusName(code: string): string {
    const item = this.listCommon?.find((c: any) => c.code === code);
    return item ? item.name : 'Không xác định';
  }


  // hiển thị chi tiết khách hàng
  openCustomerDetail(customer: any) {
    console.log('🟦 Mở popup chi tiết khách hàng:', customer);

    const modalRef = this.modalService.open(CustomerDialogComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });


    modalRef.componentInstance.customer = customer;
    modalRef.componentInstance.mode = 'view';


    modalRef.closed.subscribe(result => {
      console.log('Popup đóng, result:', result);
      if (result === 'updated') {
        this.loadPage(this.currentPage);
      }
    });
  }



  // hàm xử lí check box
  // hàm 1: Cập nhật đếm số lượng
  updateSelectedCount() {
    if (!this.tables) {
      this.selectedCount = 0;
      this.allSelected = false;
      this.indeterminate = false;
      this.showSelectMenu = false;
      return;
    }
    this.selectedCount = this.tables.filter(c => (c as any).selected).length;
    this.allSelected = this.tables.length > 0 && this.selectedCount === this.tables.length;
    this.indeterminate = this.selectedCount > 0 && this.selectedCount < this.tables.length;
    this.showSelectMenu = this.selectedCount > 0;
  }

  // hàm 2: Xử lý khi bấm "Chọn tất cả"
  indeterminate: boolean = false;
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;

    // Tạo lại mảng mới để Angular nhận biết thay đổi
    this.tables = this.tables.map(t => ({
      ...t,
      selected: checked
    }));

    //  Gọi cập nhật lại số lượng đã chọn
    this.updateSelectedCount();
  }

  toggleSelectRow(row: any) {
    row.selected = !row.selected;
    this.updateSelectedCount();
  }

  searchForm: FormGroup = this.fb.group({
    code: [null],
    name: [null],
    workSpaceId: [null],
    status: [null],
  })
  workSpaceId: any;
  listTinh: any;
  listHuyen: any;
  listXa: any;
  listHuyenMap: { [tinhCode: string]: any[] } = {};
  listXaMap: { [huyenCode: string]: any[] } = {};
  listCommon: any;
  listUser: any;
  roleWorkSpace: any;


  listCustomer: any[] = [];
  listAllCustomer() {
    const body = { id: this.workSpaceId };
    this.customerService.getAll(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        this.listCustomer = res.body.body;
        console.log('✅ Dữ liệu khách hàng:', this.listCustomer);

        // Ensure listCommon is loaded before building kanban
        if (this.listCommon && this.listCommon.length > 0) {
          this.buildKanbanColumns();
        } else {
          console.warn('⚠️ listCommon chưa được tải, đang chờ...');
          // Wait a bit and retry
          setTimeout(() => this.buildKanbanColumns(), 500);
        }
      }
    });
  }

  checkView(event: any) {
    this.isCheckView = event;
    if (this.isCheckView) {
      this.loadPage(this.currentPage);
    } else if (!this.isCheckView) {
      // this.getDeplaysListCommonCode();
      this.turnOff();
    }
  }
  search() {
    // this.loadPage(this.currentPage);
        if (this.keyword) {
      this.keyword = this.keyword.trim();
    }
    console.log('Bắt đầu tìm kiếm với từ khóa:', this.keyword); // <--- Debug xem hàm có chạy không

    this.pageCache.clear();

    this.currentPage = 0;
    this.loadPage(1);
  }
  async getListUser() {
    const body = {
      workSpaceId: this.workSpaceId
    }
    this.userService.listUserWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        this.listUser = res.body.body;
        this.listUser = this.listUser.map(u => ({
          ...u,
          displayName: `${u.username} - ${u.fullname}`
        }));
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  ttmhGroups: { name: string; color: string; items: any[] }[] = [];

  private colors: string[] = [
    '#EF4444', // đỏ
    '#10B981', // xanh lá
    '#2563EB', // xanh dương
    '#F59E0B', // cam
    '#8B5CF6', // tím
    '#0EA5E9', // xanh lam nhạt
    '#D946EF', // hồng tím
    '#22C55E', // green
    '#F43F5E', // hồng đậm
    '#6366F1'  // indigo
  ];
  // ttmhList:any;
  // getDeplaysListCommonCode() {
  //   const body = { workSpaceId: this.workSpaceId };
  //   this.commonCodeServices.listCommonByWorkSpaceId(body).subscribe({
  //     next: (res) => {
  //       if (res?.body?.responseCode === '200') {
  //         this.listCommon = res.body.body;
  //         this.ttmhList = this.listCommon.filter((it: any) => it.type === 'TTMH');
  //
  //         // const map = new Map<string, any[]>();
  //         // for (const it of ttmhList) {
  //         //   if (!map.has(it.name)) map.set(it.name, []);
  //         //   map.get(it.name)!.push(it);
  //         // }
  //         //
  //         // let index = 0;
  //         // this.ttmhGroups = Array.from(map.entries()).map(([name, items]) => {
  //         //   const color = this.colors[index % this.colors.length];
  //         //   index++;
  //         //   return { name, color, items };
  //         // });
  //       }
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }


  pageCache = new Map<number, any>();
pageSize: number = 50; // Mặc định là 50 như trong ảnh
pageSizes: number[] = [20, 50, 100]; // Các tùy chọn

// Hàm xử lý khi người dùng thay đổi dropdown
onPageSizeChange() {
  this.pageCache.clear();
  this.currentPage = 0;
  this.loadPage(0);
}

  loadPage(pageNumber: number, forceReload: boolean = false): void {
    if (forceReload) {
        this.pageCache.delete(pageNumber);
    }
    // 2. KIỂM TRA CACHE TRƯỚC
    if (this.pageCache.has(pageNumber)) {
      console.log(`Lấy trang ${pageNumber} từ cache, keyword: ${this.keyword}`);
      this.onSuccess(this.pageCache.get(pageNumber));
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      return;
    }

    // Nếu chưa có trong cache thì mới gọi API
    this.isLoading = true;
    this.customerService.search({
      pageNumber: pageNumber,
      pageSize: this.pageSize,
      workSpaceId: { equals: this.workSpaceId },

      keyword: this.keyword
    }).subscribe({
      next: (res) => {
        const data = res.body.body;

        // 3. LƯU VÀO CACHE
        if (data) {
           this.pageCache.set(pageNumber, data);
        }

        this.onSuccess(data);
        this.isLoading = false;
        this.currentPage = pageNumber;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  protected onSuccess(data: any | null): void {
    this.tables = data?.page?.content || [];
    this.tables.forEach(item => {
      (item as any).selected = false;
      (item as any).favorite = false;
    });

    this.totalPages = data?.page?.totalPages || 0;
    this.totalElements = data?.page?.totalElements || 0;
    this.currentPage = data?.page?.currentPage || 0;

    this.allSelected = false;
    this.indeterminate = false;
    this.selectedCount = 0;
    this.showSelectMenu = false;
  }


  // stringNullOrEmpty(value: any): boolean {
  //   return value !== "" && value !== null && value !== undefined;
  // }

  create() {
    const res = this.modalService.open(CustomerDialogComponent, { size: 'lg', centered: true });
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }

  edit(customer: any) {
    this.router.navigate(['/pages/category/khach-hang/add', customer.id]);
  }
  detail(customer: any) {
    this.router.navigate(['/pages/category/khach-hang/detail', customer.id, 'view']);
  }
  allColumns = [
    { key: 'code', label: 'Mã khách hàng' },
    { key: 'id', label: 'ID' },
    { key: 'hoTen', label: 'Tên khách hàng' },
    { key: 'sdt', label: 'SĐT' },
    { key: 'pho', label: 'Phố' },
    { key: 'ten_tinh', label: 'Tỉnh/Thành phố' },
    { key: 'ten_huyen', label: 'Quận/Huyện' },
    { key: 'ten_xa', label: 'Xã/Phường' },
    { key: 'relationships', label: 'Danh sách MQH' },
    { key: 'sanPhamDichVu', label: 'Sản phẩm/Dịch vụ' },
    { key: 'nhomKh', label: 'Nhóm khách hàng' },
    { key: 'yeuCau', label: 'Yêu cầu' },
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'cccd', label: 'CCCD' },
    { key: 'ngaySinh', label: 'Ngày sinh' },
    { key: 'nganhNghe', label: 'Ngành nghề' },
    { key: 'thuNhap', label: 'Thu nhập' },
    { key: 'trangThaiMuaHang', label: 'Trạng thái mua hàng' },
    { key: 'nhuCau', label: 'Nhu cầu' },
    { key: 'soThich', label: 'Sở thích' },
    { key: 'moiQuanTam', label: 'Mối quan tâm' },
    { key: 'sanPhamTungMua', label: 'Sản phẩm từng mua' },
    { key: 'kenhLienHe', label: 'Kênh liên hệ' },
    { key: 'ngayDongPhiGanNhat', label: 'Ngày đóng phí gần nhất' },
    { key: 'ngayDongPhiKeTiep', label: 'Ngày đóng phí kế tiếp' },
    { key: 'tongDoanhThu', label: 'Tổng doanh thu' },
    { key: 'doanhThuGanNhat', label: 'Doanh thu gần nhất' },
    { key: 'danhSachGapMat', label: 'Danh sách gặp mặt' },
    { key: 'nguoiPhuTrach', label: 'Người phụ trách' },
    { key: 'nhanVienTuVan', label: 'Nhân viên tư vấn' },
    { key: 'nguon', label: 'Nguồn' },
    { key: 'trangThaiCskh', label: 'Trạng thái CSKH' },
    { key: 'chiPhiCskh', label: 'Chi phí CSKH' },
    { key: 'soTienHienTai', label: 'Số tiền hiện tại' },
    { key: 'tongTienCskh', label: 'Tổng tiền CSKH' },
    { key: 'tinhTrangHonNhan', label: 'Tình trạng hôn nhân' },
    { key: 'email', label: 'Email' },
    { key: 'medias', label: 'Danh sách files' },

  ];

  displayedColumns = ['code', 'hoTen', 'gioiTinh', 'ngaySinh', 'sdt', 'ten_tinh'];
  displayedColumnsDefault: string[] = [...this.displayedColumns];


  // getProvince(){
  //   this.locationService.listProvince().subscribe(res=>{
  //     if (res && res.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
  //       this.listTinh = res.body;
  //     } else {
  //       console.error('Danh sách tỉnh:', res.responseMessage);
  //     }
  //   })
  // }
  // getDistrict(item:any){
  //   debugger;
  //   const body={
  //     code:item.code
  //   }
  //   this.locationService.listDistrict(body).subscribe(res=>{
  //     if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
  //       this.listHuyen = res.body.body;
  //     } else {
  //       console.error('Danh sách huyện:', res.responseMessage);
  //     }
  //   })
  // }
  // getWard(item:any){
  //   const body={
  //     code:item.code
  //   }
  //   this.locationService.listWard(body).subscribe(res=>{
  //     if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
  //       this.listXa = res.body.body;
  //     } else {
  //       console.error('Danh sách xã:', res.responseMessage);
  //     }
  //   })
  // }
  // loadDistricts(tinhCode: string) {
  //   if (this.listHuyenMap[tinhCode]) return; // cache rồi thì thôi
  //   this.locationService.listDistrict({ code: tinhCode }).subscribe(res => {
  //     this.listHuyenMap[tinhCode] = res.body.body;
  //   });
  // }
  // loadWard(huyenCode: string) {
  //   if (this.listXaMap[huyenCode]) return; // cache rồi thì thôi
  //   this.locationService.listWard({ code: huyenCode }).subscribe(res => {
  //     this.listXaMap[huyenCode] = res.body.body;
  //   });
  // }

  getListCommonCode() {
    const body = { workSpaceId: this.workSpaceId };
    this.commonCodeServices.listCommonByWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') {
        this.listCommon = res.body.body.map((item: any, index: number) => ({
          ...item,
          color: this.colors[index % this.colors.length]
        }));
        console.log('✅ listCommon:', this.listCommon);
      } else {
        console.error('❌ Lỗi lấy listCommon:', res.responseMessage);
      }
    });
  }

  private getRandomColor(): string {
    const colors = [
      '#2563EB', // xanh dương
      '#10B981', // xanh lá
      '#8B5CF6', // tím
      '#F59E0B', // vàng cam
      '#EF4444', // đỏ
      '#0EA5E9', // xanh lam nhạt
      '#D946EF', // hồng tím
      '#22C55E', // green
      '#F43F5E', // hồng đậm
      '#6366F1'  // indigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private escapeHtml(v: any): string {
    const s = String(v ?? '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private parseRelationships(raw: any): Relationship[] {
    if (raw == null) return [];
    try {
      let data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (typeof data === 'string') data = JSON.parse(data); // double-encoded
      return Array.isArray(data) ? (data as Relationship[]) : [];
    } catch {
      return [];
    }
  }


  private buildRelRows(raw: any): { hoten: string; code: string; labels: string[] }[] {
    const arr = this.parseRelationships(raw);
    const map = new Map<number, { hoten: string; code: string; labels: Set<string> }>();
    for (const r of arr) {
      const id = Number(r.customer_id);
      if (!map.has(id)) map.set(id, { hoten: r.hoten || '', code: r.code || '', labels: new Set<string>() });
      if (r.label) map.get(id)!.labels.add(String(r.label));
    }
    return Array.from(map.values()).map(v => ({ hoten: v.hoten, code: v.code, labels: [...v.labels] }));
  }



  private buildMiniTableHtml(rows: { hoten: string; code: string; labels: string[] }[]): string {
    if (!rows?.length) return '';
    const head =
      `<div class="mini-table-wrap"><table class="mini-table" style="border:1px solid black">` +
      `<thead><tr><th></th></tr></thead><tbody>`;
    const body = rows
      .map(r =>
        `<tr>` +
        `<td>${this.escapeHtml(r.hoten)}</td>` +
        // `<td>${this.escapeHtml(r.code)}</td>` +
        // `<td>${this.escapeHtml(r.labels.join(', '))}</td>` +
        `</tr>`
      )
      .join('');
    const tail = `</tbody></table></div>`;
    return head + body + tail;
  }

  // Nếu bạn render động các cột, dùng hàm này để biết cột nào cần innerHTML
  isHtmlColumn(key: string): boolean {
    return key === 'relationships' || key === 'medias' || key === 'danhSachGapMat';
  }

  // (tuỳ chọn) lấy label từ allColumns
  getColumnLabel(key: string): string {
    const c = this.allColumns.find(c => c.key === key);
    return c?.label ?? key;
  }
  private parseMedias(raw: any): MediaItem[] {
    if (raw == null) return [];
    try {
      let data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (typeof data === 'string') data = JSON.parse(data); // double-encoded
      return Array.isArray(data) ? (data as MediaItem[]) : [];
    } catch {
      return [];
    }
  }

  // Gom hàng để hiển thị (loại trùng theo id)
  private buildMediaRows(raw: any): { id?: number | string; file_name: string; url: string }[] {
    const arr = this.parseMedias(raw);
    const map = new Map<string | number, { id?: number | string; file_name: string; url: string }>();

    for (const m of arr) {
      const id = (m.id ?? `${m.url ?? m.file_name ?? ''}`); // key fallback
      const file_name = m.file_name ?? '';
      const url = m.url ?? '';
      if (!url) continue;
      map.set(id as any, { id, file_name, url });
    }
    return Array.from(map.values());
  }

  // Icon theo đuôi file (đơn giản)
  private fileIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(n)) return '🖼️';
    if (/\.(mp4|mov|avi|mkv|webm)$/.test(n)) return '🎬';
    if (/\.(mp3|wav|m4a|flac)$/.test(n)) return '🎵';
    if (/\.(pdf)$/.test(n)) return '📄';
    if (/\.(doc|docx)$/.test(n)) return '📝';
    if (/\.(xls|xlsx|csv)$/.test(n)) return '📊';
    if (/\.(ppt|pptx)$/.test(n)) return '📈';
    return '📎';
  }

  // Dựng HTML danh sách medias (link mở tab mới)
  private buildMediaHtml(rows: { id?: number | string; file_name: string; url: string }[]): string {
    if (!rows?.length) return '';
    const items = rows.map(r => {
      const name = this.escapeHtml(r.file_name || r.url);
      const href = this.escapeHtml(this.api.getCatalogApi() + r.url || '#');
      const idBadge = r.id != null ? `<span class="ms-2 text-muted"></span>` : '';
      const icon = this.fileIcon(r.file_name || r.url);

      return (
        `<li style="display:flex;align-items:center;gap:8px;padding:2px 0;">` +
        `<span>${icon}</span>` +
        `<a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a>` +
        idBadge +
        `</li>`
      );
    }).join('');

    return (
      `<div class="mini-table-wrap">` +
      `<ul class="mini-media" style="list-style:none;margin:0;padding-left:0;">` +
      items +
      `</ul>` +
      `</div>`
    );
  }
  private parseMeetDates(raw: any): string[] {
    if (raw == null) return [];
    try {
      let data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (typeof data === 'string') data = JSON.parse(data); // double-encoded
      if (!Array.isArray(data)) return [];
      // chỉ giữ chuỗi hợp lệ
      return data.filter(x => typeof x === 'string' && x.length);
    } catch {
      return [];
    }
  }

  // Định dạng dd-MM-yyyy theo UTC (để ra đúng 07-09-2025 như bạn muốn)
  private toDDMMYYYY_UTC(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // Tạo HTML danh sách: "lần 1: ..., lần 2: ..."
  private buildMeetHtml(raw: any): string {
    const arr = this.parseMeetDates(raw);

    if (!arr.length) return '';

    // chuẩn hóa: loại trùng và sắp tăng dần theo thời gian
    const uniq = Array.from(new Set(arr));
    uniq.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const lis = uniq.map((iso, i) => {
      const label = `lần ${i + 1}: ${this.toDDMMYYYY_UTC(iso)}`;
      return `<li style="padding:2px 0;">${this.escapeHtml(label)}</li>`;
    }).join('');

    return `<ul class="mini-meet" style="list-style:none;margin:0;padding-left:0;">${lis}</ul>`;
  }
  //  getDisplayValue //
  getDisplayValue(customer: any, columnKey: string): string {
    if (!customer) return '';

    if (columnKey === 'xa') {
      const listWard = this.listXaMap?.[customer['huyen']] || [];
      const found = listWard.find((h: any) => h.code === customer[columnKey]);
      return found ? found.name : '';
    }

    if (['kenhLienHe', 'nhomKh', 'tinhTrangMuaHang', 'trangThaiCskh'].includes(columnKey)) {
      const code = customer[columnKey];
      const found = this.listCommon?.find((t: any) => String(t.code) === String(code));

      if (found && found.name) return found.name;
      if (typeof code === 'string' && code.trim()) return code.trim();
      return found ? found.name : '';
    }

    if (['ngaySinh', 'ngayDongPhiGanNhat', 'ngayDongPhiKeTiep'].includes(columnKey)) {
      const v = customer[columnKey];
      if (!v) return '';
      const d = new Date(v);
      return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
    }

    if (columnKey === 'nguoiPhuTrach' || columnKey === 'nhanVienTuVan') {
      const found = this.listUser?.find((u: any) => String(u.id) === String(customer[columnKey]));
      return found?.displayName || found?.name || found?.email || '';
    }

    if (columnKey === 'relationships') {
      const rows = this.buildRelRows(customer.relationships ?? customer.relationships_json);
      return this.buildMiniTableHtml(rows); // << trả về HTML string
    }
    if (columnKey === 'medias') {
      // backend có thể trả 'medias' hoặc 'medias_json' → lấy cái có dữ liệu
      const rows = this.buildMediaRows(customer.medias ?? customer.medias_json);
      return this.buildMediaHtml(rows);
    }
    if (columnKey === 'danhSachGapMat') {
      // backend có thể trả 'danhSachGapMat' hoặc 'danh_sach_gap_mat'
      const raw = customer.danhSachGapMat ?? customer.danh_sach_gap_mat;
      return this.buildMeetHtml(raw);  // trả về HTML string
    }
    const val = customer[columnKey];
    return val == null ? '' : String(val);
  }

  // Chỉ định cột nào là HTML (mini-table)

  @ViewChild('menuRef', { static: false }) menuRef?: ElementRef<HTMLElement>;
  @ViewChild('btnRef', { static: false }) btnRef?: ElementRef<HTMLElement>;

  // đóng/mở
  openMenu(ev: Event) {
    ev.stopPropagation();
    this.isOn = !this.isOn;


    // Bảo vệ: nếu vừa mở, bỏ qua "document:click" tiếp theo (trường hợp có listener khác bắt sau)
    if (this.isOn) {
      this._ignoreNextDocClick = true;
      setTimeout(() => (this._ignoreNextDocClick = false), 0);
    }
  }

  turnOff() { this.isOn = false; }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    if (!this.isOn) return;
    if (this._ignoreNextDocClick) return;

    const t = event.target as Node | null;
    const menuEl = this.menuRef?.nativeElement;
    const btnEl = this.btnRef?.nativeElement;

    // chỉ đóng khi click ngoài cả menu và nút
    if (t && !menuEl?.contains(t) && !btnEl?.contains(t)) {
      this.turnOff();
    }
  }

  // ===== select-all helpers =====
  private allKeys(): string[] { return this.allColumns.map(c => c.key); }

  get isAllSelected(): boolean {
    return this.displayedColumns.length > 0 &&
      this.displayedColumns.length === this.allColumns.length;
  }
  get isIndeterminate(): boolean {
    return this.displayedColumns.length > 0 &&
      this.displayedColumns.length < this.allColumns.length;
  }
  selectAll(): void { this.displayedColumns = this.allKeys().slice(); }
  // clearAll(): void { this.displayedColumns = []; }
  // toggleAll(checked: boolean): void { checked ? this.selectAll() : this.clearAll(); }

  toggleAll(): void {
  const isAll = this.tempColumns.length === this.allColumns.length;

  if (isAll) {
    //  Trở về mặc định
    this.tempColumns = [...this.displayedColumnsDefault];
  } else {
    //  Chọn tất cả
    this.tempColumns = this.allKeys().slice();
  }
}

  toggleColumn(key: string) {
    const i = this.displayedColumns.indexOf(key);
    if (i > -1) this.displayedColumns.splice(i, 1);
    else this.displayedColumns.push(key);

    const order = this.allKeys();
    const allowed = new Set(order);
    //this.displayedColumns = order.filter(k => allowed.has(k) && this.displayedColumns.includes(k));
    this.tempColumns = order.filter(k => allowed.has(k) && this.displayedColumns.includes(k));
  }
 //cập nhật cột hiển thị
applyColumns(): void {
    // 1. Cập nhật giao diện (RAM)
    this.displayedColumns = [...this.tempColumns];
    console.log('Cột hiển thị sau khi áp dụng:', this.displayedColumns);

    // 2. Lưu vào biến tạm (giữ nguyên code cũ)
    localStorage.setItem('displayedColumns', JSON.stringify(this.displayedColumns));

    // 3. [THÊM MỚI] Nếu đang ở trong một Chế độ (Preset), CẬP NHẬT luôn chế độ đó
    if (this.currentPresetName) {
        localStorage.setItem('preset_' + this.currentPresetName, JSON.stringify(this.displayedColumns));
        console.log(`Đã tự động cập nhật lại ${this.currentPresetName}`);
    }

    this.turnOff();
    this.loadPage(this.currentPage);
  }
  trackByKey = (_: number, c: ColumnDef) => c.key;

  protected readonly ROLE_WORKSPACE = ROLE_WORKSPACE;

  // popup chỉnh sửa khách hàng
  showEditBox = false;
  editingCustomer: any = null;
  editForm!: FormGroup;

ngOnInit(): void {
    // 1. Load danh sách các preset có sẵn và thanh hiển thị
    this.loadPresetList();
    this.loadVisibleBarFromStorage();

    // --- SỬA ĐOẠN NÀY ĐỂ FIX LỖI HIỂN THỊ ---

    // Lấy tên preset đang active lần trước
    const lastActive = localStorage.getItem('currentActivePreset');

    // Kiểm tra kỹ: Có tên active VÀ dữ liệu của preset đó thực sự còn tồn tại
    const isPresetValid = lastActive && localStorage.getItem('preset_' + lastActive);

    if (isPresetValid) {
        // TRƯỜNG HỢP 1: Có chế độ cũ hợp lệ -> Load lại nó
        this.loadPreset(lastActive);

        // Logic phụ: Nếu nút đang active bị thiếu trên thanh hiển thị -> Thêm nó vào lại
        const isExist = this.visiblePresets.some(p => p.name === lastActive);
        if (!isExist) {
             this.addToVisibleBar(lastActive);
        }
    } else {
        // TRƯỜNG HỢP 2: Không có chế độ nào (Mới vào hoặc đã xóa cache)
        // -> Load cột MẶC ĐỊNH để bảng không bị trắng trơn
        console.log('Không có preset -> Load mặc định');

        // Copy từ danh sách gốc (quan trọng: dùng [...])
        this.displayedColumns = [...this.displayedColumnsDefault];

        // Reset trạng thái active
        this.currentPresetName = '';
        localStorage.removeItem('currentActivePreset');
    }


    const authWs = localStorage.getItem('authWs');
    if (authWs) {
      const decodedWs: any = jwtDecode(authWs);
      this.workSpaceId = decodedWs.workSpaceId;
      this.roleWorkSpace = decodedWs.workSpaceRole;
    }

    this.getListCommonCode();
    this.loadPage(0);
    this.getListUser();
    this.loadGroupsFromApi();

    this.editForm = this.fb.group({
      id: [''],
      hoTen: [''],
      sdt: [''],
      gioiTinh: [''],
      ngaySinh: [''],
      nganhNghe: [''],
      thuNhap: [''],
      tinhTrangMuaHang: [''], // <--- Thêm trường này
      yeuCau: ['']
    });
    this.generateCalendar(this.currentYear, this.currentMonth);
  }


  // Mở form popup nội bộ
  openEditBox(customer: any) {
    console.log('🟦 Mở popup chỉnh sửa khách hàng:', customer);

    const modalRef = this.modalService.open(CustomerDialogComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });

    // Truyền dữ liệu khách hàng vào dialog
    modalRef.componentInstance.customer = customer;
    modalRef.componentInstance.mode = 'edit';

    // Xử lý khi dialog đóng
    modalRef.result.then(
      (result) => {
        console.log('Dialog đóng với kết quả:', result);
        if (result?.result === 'complete' || result === 'updated') {
          // Cập nhật lại dữ liệu
          if (this.currentView === 'list') {
            this.loadPage(this.currentPage);
          } else if (this.currentView === 'kaban') {
            this.listAllCustomer();
          } else if (this.currentView === 'calendar') {
            this.getListCalenlendar();
          }
        }
      },
      (reason) => {
        console.log('Dialog bị dismiss:', reason);
      }
    );
  }

  // Đóng form popup
  closeEditBox() {
    this.showEditBox = false;
    this.editingCustomer = null;
  }

  // Lưu thông tin khách hàng
  saveEditBox() {
    const data = this.editForm.value;

    this.customerService.insertOrUpdate(data).subscribe({
      next: (res) => {
        if (res.body?.body === true) {
          alert('✅ Cập nhật thành công!');
          this.showEditBox = false;

          // Cập nhật lại bảng hoặc danh sách
          if (this.currentView === 'list') {
            this.loadPage(this.currentPage);
          } else if (this.currentView === 'kaban') {
            this.listAllCustomer();
          }
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi lưu khách hàng:', err);
        alert('Lưu thất bại, vui lòng thử lại.');
      }
    });
  }

  // popup chi tiết sự kiện
  isEventDetailVisible = false;
  selectedEvent: any = null;


  closeEventDetail() {
    this.isEventDetailVisible = false;
    this.selectedEvent = null;
  }

  // tìm kiếm
  keyword: string = '';

}


