// company.component.ts
import { Component, OnInit } from "@angular/core";
import { COMMON_STATUS, ROLE } from "../Contants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import { CompanyService } from "src/app/core/services/services-app/company.service";
import { ApiUrl } from "src/app/shared/constant/ApiUrl.constant";
import { GroupTeamDialogComponent } from "./group-team-dialog.component";
import { GroupTeamService } from "src/app/core/services/services-app/group-team.service";
import { TreeGroupTeamComponent } from "./tree-group-team.component";

@Component({
  selector: 'app-group',
  templateUrl: './group-team.component.html'
})
export class GroupTeamComponent implements OnInit {
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
  listCompany:any[] = [];
  breadCrumbItems = [
    { label: 'menu.sysMng' },
    { label: 'Quản lý công ty', active: true }
  ];
url:any;
  labelStatus={
    [COMMON_STATUS.ACTIVE]:'Đang hoạt động',
    [COMMON_STATUS.INACTIVE]:'Ngưng hoạt động'
  }
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private groupTeamService: GroupTeamService,
    private api: ApiUrl,
    private companyService:CompanyService
  ) {}

  searchForm: FormGroup = this.fb.group({
    code: [null],
    name: [null],
    companyId: [null],
    status: [null],
  });

  ngOnInit(): void {
        this.getListCompany();
    const token = localStorage.getItem('authData');
        this.url=`${this.api.getCatalogApi()}`;
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
    }
    this.loadPage(0);
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
    this.groupTeamService.search({
      pageNumber: page,
      pageSize: 10,
      code: this.stringNullOrEmpty(this.searchForm.get("code")?.value) ? { contains: this.searchForm.get("code")?.value } : null,
      name: this.stringNullOrEmpty(this.searchForm.get("name")?.value) ? { contains: this.searchForm.get("name")?.value } : null,
      status: this.stringNullOrEmpty(this.searchForm.get("status")?.value) ? { contains: this.searchForm.get("status")?.value } : null,
      companyId: this.stringNullOrEmpty(this.searchForm.get("companyId")?.value) ? { equals: this.searchForm.get("companyId")?.value } : null,
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
  }

  stringNullOrEmpty(value: any): boolean {
    return value !== "" && value !== null && value !== undefined;
  }

  create() {
      const res = this.modalService.open(GroupTeamDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới đội nhóm"
      res.componentInstance.listCompany=this.listCompany;
      res.closed.subscribe(temp => {
        this.loadPage(0);
      })
}

  edit(company: any) {
    const res = this.modalService.open(GroupTeamDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới đội nhóm";
      res.componentInstance.inputData = company;
      res.componentInstance.listCompany=this.listCompany;
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
  }
viewTree(company: any) {
    const res = this.modalService.open(TreeGroupTeamComponent, {size: 'xl', centered: true});
      res.componentInstance.title = "Cập nhật thông công ty";
      res.componentInstance.companyId=company.companyId;
      res.componentInstance.groupMainId=company.groupMainId;
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
  }

}
