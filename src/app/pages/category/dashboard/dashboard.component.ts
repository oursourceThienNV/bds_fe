import { Component, OnInit } from '@angular/core';
import {CustomerDialogComponent} from "../customer/customer-dialog.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Cards Summary
  // cards = [
  //   {
  //     icon: 'fa fa-dollar-sign',
  //     title: 'Doanh số / doanh số tổng',
  //     value: '$198k',
  //     percentage: '37.8%'
  //   },
  //   {
  //     icon: 'fa fa-users',
  //     title: 'Khách hàng liên hệ / tổng data',
  //     value: '$198k',
  //     percentage: '37.8%'
  //   },
  //   {
  //     icon: 'fa fa-shopping-bag',
  //     title: 'Đơn chốt / trung bình đơn/ngày',
  //     value: '$198k',
  //     percentage: '37.8%'
  //   },
  //   {
  //     icon: 'fa fa-chart-line',
  //     title: 'Chi phí Marketing / tổng lead',
  //     value: '$198k',
  //     percentage: '37.8%'
  //   },
  // ];

  // Sticky notes/tasks
  stickNotes = [
    { id: 1, content: 'Công việc 1' },
    { id: 2, content: 'Công việc 2' },
    { id: 3, content: 'Công việc 3' }
  ];

  // In progress items
  progressItems = [
    { title: 'CRM system design', status: 'Medium', participants: 'Azhar', date: '12/04/2025' },
    { title: 'API Integration', status: 'High', participants: 'Binh', date: '15/04/2025' }
  ];

  // Done items
  doneItems = [
    { title: 'UI/UX Design', status: 'Done', participants: 'Linh', date: '10/04/2025' },
    { title: 'Backend Setup', status: 'Done', participants: 'Khanh', date: '11/04/2025' }
  ];

 currentDate = new Date();
  currentView: 'day' | 'week' | 'month' = 'month'; // default là tháng
  calendarDays: Array<{ number: number | null, isToday: boolean, events: string[] }> = [];

  ngOnInit() {
    this.generateCalendarDays();
  }
  constructor(
  private modalService: NgbModal){

  }

  // Xử lý click vào nút chế độ xem
  setView(view: 'day' | 'week' | 'month') {
    this.currentView = view;

    if (view === 'month') {
      this.generateCalendarDays();
    } else {
      // Các chế độ khác sẽ có hàm tương ứng
      this.calendarDays = []; // hoặc gọi generateWeekDays / generateDayView
    }
  }
  create() {
    const res = this.modalService.open(CustomerDialogComponent, {size: 'lg', centered: true});
    // res.componentInstance.title = "Thêm mới thông tin công ty"
    // res.componentInstance.listCompany=this.listCompany;
    // res.closed.subscribe(temp => {
    //   this.loadPage(this.currentPage)
    // })
  }

  // Cũ: tạo dữ liệu ngày trong tháng
  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    const temp: typeof this.calendarDays = [];

    for (let i = 0; i < startDay; i++) {
      temp.push({ number: null, isToday: false, events: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      temp.push({ number: day, isToday, events: this.getEventsForDate(date) });
    }

    this.calendarDays = temp;
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    if (this.currentView === 'month') this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    if (this.currentView === 'month') this.generateCalendarDays();
  }

  getEventsForDate(date: Date): string[] {
    const key = date.toISOString().split('T')[0];
    const events: { [key: string]: string[] } = {
      '2025-07-20': ['Meeting A'],
    };
    return events[key] || [];
  }

getFormattedFullDate(): string {
  return this.currentDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

getCurrentWeekDates(): Date[] {
  const startOfWeek = new Date(this.currentDate);
  const day = startOfWeek.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // bắt đầu từ Thứ 2
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });
}

prevDate() {
  if (this.currentView === 'day') {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
  } else if (this.currentView === 'week') {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
  } else {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
  }
  this.generateCalendarDays();
}

nextDate() {
  if (this.currentView === 'day') {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
  } else if (this.currentView === 'week') {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
  } else {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
  }
  this.generateCalendarDays();
}

  // Notifications
  notifications = [
  {
    title: 'Công ty TNHH',
    avatar: 'assets/images/cty1.svg',
    badge: 2
  },
  {
    title: 'Phòng Marketing',
    avatar: 'assets/images/cty2.svg',
    badge: 2
  },
  {
    title: 'Nhóm design',
    avatar: 'assets/images/cty3.svg',
    badge: 2
  }
];

}
