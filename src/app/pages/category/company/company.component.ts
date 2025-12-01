// company.component.ts
import { Component, OnInit } from "@angular/core";
import { COMMON_STATUS, ROLE } from "../Contants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import { CompanyService } from "src/app/core/services/services-app/company.service";
import { CompanyDialogComponent } from "./company-dialog.component";
import { ApiUrl } from "src/app/shared/constant/ApiUrl.constant";
import {ApplyKeyDialogComponent} from "./apply-key-dialog.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html'
})
export class CompanyComponent implements OnInit {
  ROLE = ROLE;
  role: any;
  tables: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  selectedAll: boolean = false;
  page = new Page();
  COMMON_STATUS = COMMON_STATUS;
  isLoading: boolean = false;
  breadCrumbItems = [
    { label: 'menu.sysMng' },
    { label: 'Quản lý công ty', active: true }
  ];

//   roleLabelMap: any = {
//     ADMIN: 'Quản trị viên',
//     SALES: 'Kinh doanh',
//     TELESALES: 'CSKH',
//     CUSTOMER: 'Khách hàng'
//   };
url:any;
  labelStatus={
    [COMMON_STATUS.ACTIVE]:'Đang hoạt động',
    [COMMON_STATUS.INACTIVE]:'Vô hiệu hóa'
  }
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private api: ApiUrl,
    private datePipe: DatePipe
  ) {}

  searchForm: FormGroup = this.fb.group({
    name: [null],
    phone: [null],
    status: [null],
    email: [null],
  });

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
        this.url=`${this.api.getCatalogApi()}`;
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
    }
    this.loadPage(0);
  }

  search() {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.companyService.search({
      pageNumber: page,
      pageSize: 10,
      name: this.stringNullOrEmpty(this.searchForm.get("name")?.value) ? { contains: this.searchForm.get("name")?.value } : null,
      phone: this.stringNullOrEmpty(this.searchForm.get("phone")?.value) ? { contains: this.searchForm.get("phone")?.value } : null,
      email: this.stringNullOrEmpty(this.searchForm.get("email")?.value) ? { contains: this.searchForm.get("email")?.value } : null,
      status: this.stringNullOrEmpty(this.searchForm.get("status")?.value) ? { contains: this.searchForm.get("status")?.value } : null,
    }).subscribe({
      next: (res) => {
        this.onSuccess(res.body.body);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
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
      const res = this.modalService.open(CompanyDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới thông tin công ty"
      
    
      res.closed.subscribe(temp => {
        // Code cũ: this.loadPage(this.currentPage) -> Sai, nó giữ nguyên trang hiện tại    
       
        this.loadPage(0); 
      })
}

  edit(company: any) {
    const res = this.modalService.open(CompanyDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Cập nhật thông công ty";
      res.componentInstance.inputData = company;
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
  }
  updateLicense(table) {
    const res = this.modalService.open(ApplyKeyDialogComponent, {size: 'lg', centered: true});
    res.componentInstance.title = 'Update License';
    res.componentInstance.inputData = table;
    res.componentInstance.role=this.role;
    res.componentInstance.checkAction = "L";
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';  // Định dạng ngày theo 'dd/MM/yyyy'
  }

  // Hàm tính toán thời gian còn lại
  getRemainingTime(expiredTime: string | Date): string {
    const currentDate = new Date();
    const expirationDate = new Date(expiredTime);

    // Tính chênh lệch thời gian theo milliseconds
    const timeDifference = expirationDate.getTime() - currentDate.getTime();

    // Tính số ngày và tháng còn lại
    const remainingDays = Math.floor(timeDifference / (1000 * 3600 * 24)); // Số ngày
    const remainingMonths = Math.floor(remainingDays / 30);  // Ước tính số tháng

    if (remainingDays < 0) {
      return "(Đã hết hạn)";
    } else {
      return `(${remainingMonths} tháng, ${remainingDays % 30} ngày còn lại)`;  // Hiển thị theo tháng, ngày
    }
  }

  // Hàm kiểm tra xem ngày hết hạn đã qua chưa
  isExpired(expiredTime: string | Date): boolean {
    const currentDate = new Date();
    const expirationDate = new Date(expiredTime);
    return expirationDate.getTime() < currentDate.getTime(); // Trả về true nếu đã hết hạn
  }

  // Hàm kiểm tra nếu thời gian còn lại ít hơn 1 tháng
  isLessThanOneMonth(expiredTime: string | Date): boolean {
    const currentDate = new Date();
    const expirationDate = new Date(expiredTime);

    // Tính chênh lệch thời gian theo milliseconds
    const timeDifference = expirationDate.getTime() - currentDate.getTime();
    const remainingDays = Math.floor(timeDifference / (1000 * 3600 * 24)); // Số ngày

    // Kiểm tra nếu thời gian còn lại ít hơn 1 tháng (30 ngày)
    return remainingDays < 30 && remainingDays >= 0;
  }
}
