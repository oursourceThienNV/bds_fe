import { Component, OnInit } from "@angular/core";
import {COMMMON_CODE, COMMON_STATUS, ROLE} from "../Contants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import { CompanyService } from "src/app/core/services/services-app/company.service";
import {CommonCodeDialogComponent} from "./common-code-dialog.component";
import {CommonCodeServices} from "../../../core/services/services-app/common-code.service";
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: 'app-group',
  templateUrl: './common-code.component.html'
})
export class CommonCodeComponent implements OnInit {
  ROLE = ROLE;
  role: any;
  tables: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  selectedAll: boolean = false;
  page = new Page();
  COMMMON_CODE = COMMMON_CODE;
  isLoading: boolean = false;
  listCompany:any[] = [];
url:any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonCodeServices: CommonCodeServices,
    private companyService:CompanyService,
    private route: ActivatedRoute
  ) {}

  searchForm: FormGroup = this.fb.group({
    code: [null],
    name: [null],
    workSpaceId: [null],
    status: [null],
    type:[""],
    text:[""]
  });
  tab:any;
  title:any;
  valueType:any;
  ngOnInit(): void {
    this.getListCompany();

    const token = localStorage.getItem('authData');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
    }

    const authWs = localStorage.getItem('authWs');
    if (authWs) {
      const decodedWs: any = jwtDecode(authWs);
      const workSpaceId = decodedWs.workSpaceId;
      this.searchForm.get('workSpaceId')?.setValue(workSpaceId);
    }

    // 2) Theo dõi tab và reload dữ liệu mỗi lần tab đổi
    this.route.queryParamMap.subscribe(q => {
      this.tab = (q.get('tab') as string) || 'customer-group';

      if (this.tab === 'customer-group') {
        this.title = 'Nhóm Khách Hàng';
        this.valueType = COMMMON_CODE.NHOM_KH;
      } else if (this.tab === 'industry') {
        this.title = 'Ngành nghề';
        this.valueType = COMMMON_CODE.LINHVUC;
      } else if (this.tab === 'source') {
        this.title = 'Nguồn';
        this.valueType = COMMMON_CODE.SOURCE;
      } else if (this.tab === 'channel') {
        this.title = 'Kênh liên hệ';
        this.valueType = COMMMON_CODE.CHANNEL;
      } else if (this.tab === 'deal-status') {
        this.title = 'Trạng thái giao dịch';
        this.valueType = COMMMON_CODE.TTMH;
      } else {
        // fallback
        this.tab = 'customer-group';
        this.title = 'Nhóm Khách Hàng';
        this.valueType = COMMMON_CODE.NHOM_KH;
      }

      this.searchForm.get('type')?.setValue(this.valueType);

      // Quan trọng: load sau khi đã set type theo tab
      this.loadPage(0);
    });
  }

  search() {
    this.loadPage(this.currentPage);
  }
  getListCompany(){
    debugger;
    this.companyService.getAll().subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listCompany = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  loadPage(page: number): void {
    this.isLoading = true;
    this.commonCodeServices.search({
      pageNumber: page,
      pageSize: 10,
      text: this.stringNullOrEmpty(this.searchForm.get("text")?.value) ? { contains: this.searchForm.get("text")?.value } : null,
      type: this.stringNullOrEmpty(this.searchForm.get("type")?.value) ? { contains: this.searchForm.get("type")?.value } : null,
      name: this.stringNullOrEmpty(this.searchForm.get("name")?.value) ? { contains: this.searchForm.get("name")?.value } : null,
      workSpaceId: this.stringNullOrEmpty(this.searchForm.get("workSpaceId")?.value) ? { equals: this.searchForm.get("workSpaceId")?.value } : null,
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
customSearchFn(term: string, item: any): boolean {
  const keyword = term.toLowerCase();
  return item.name?.toLowerCase().includes(keyword) || item.phone?.toLowerCase().includes(keyword);
}
  protected onSuccess(data: any | null): void {
    debugger;
    this.tables = data?.page?.content || [];
    this.totalPages = data?.page?.totalPages || 0;
    this.totalElements = data?.page?.totalElements || 0;
    this.currentPage = data?.page?.currentPage || 0;

    if (this.valueType === COMMMON_CODE.NHOM_KH) { 
      // Lưu mảng 'tables' vào LocalStorage với tên chìa khóa là 'DATA_NHOM_KH'
      localStorage.setItem('DATA_NHOM_KH', JSON.stringify(this.tables));
      console.log("Đã lưu cache nhóm khách hàng!");
  }
  }

  stringNullOrEmpty(value: any): boolean {
    return value !== "" && value !== null && value !== undefined;
  }

  create() {
      const res = this.modalService.open(CommonCodeDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới thông tin"
      res.componentInstance.listCompany=this.listCompany;
      res.componentInstance.type=this.valueType;
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
}

  edit(company: any) {
    const res = this.modalService.open(CommonCodeDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Cập nhật thông tin";
      res.componentInstance.inputData = company;
      res.componentInstance.listCompany=this.listCompany;
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
  }
}
