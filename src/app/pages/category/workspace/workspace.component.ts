import { Component, OnInit } from "@angular/core";
import { COMMON_STATUS, ROLE } from "../Contants";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import { CompanyService } from "src/app/core/services/services-app/company.service";
import { ApiUrl } from "src/app/shared/constant/ApiUrl.constant";
import {WorkspaceService} from "../../../core/services/services-app/workspace.service";
import {Router} from "@angular/router";
import { WorkspaceFormComponent } from "./workspace-form.components";

@Component({
  selector: 'app-company',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  ROLE = ROLE;
  role: any;
  tables: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  page = new Page();
  isLoading: boolean = false;
  breadCrumbItems = [
    
    { label: 'menu.sysMng' },
    { label: 'Quản lý không gian làm việc', active: true }
  ];
  
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private workspaceService: WorkspaceService,
    // private router: Router  // không dùng router nữa 
  ) {}

  searchForm: FormGroup = this.fb.group({
    name: [null],
    code: [null],
  });

  ngOnInit(): void {
    
    const token = localStorage.getItem('authData');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
    }
    this.loadPage(0);
  }
  search() {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.workspaceService.search({
      pageNumber: page,
      pageSize: 10,
      name: this.stringNullOrEmpty(this.searchForm.get("name")?.value) ? { contains: this.searchForm.get("name")?.value } : null,
      code: this.stringNullOrEmpty(this.searchForm.get("code")?.value) ? { contains: this.searchForm.get("code")?.value } : null,
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
    // this.router.navigate(['/pages/category/khong-gian-lam-viec/add'])
    this.openWorkspaceModal(null); // Gọi hàm mở modal
}

  edit(workspace: any) {
    // this.router.navigate(['/pages/category/khong-gian-lam-viec/add', workspace.id]);
    this.openWorkspaceModal(workspace.id); // Gọi hàm mở modal với ID
  }
  // 5. Tạo hàm mới để mở modal
  openWorkspaceModal(workspaceId: any): void {
    // Mở component WorkspaceFormComponent làm modal
    const modalRef = this.modalService.open(WorkspaceFormComponent, {
      size: 'xl', // Kích thước modal (ví dụ: 'lg', 'xl')
      centered: true, // Căn giữa
      backdrop: 'static' // Không cho đóng khi bấm bên ngoài
    });

    // Truyền ID vào cho modal (nếu là edit)
    if (workspaceId) {
      modalRef.componentInstance.workspaceId = workspaceId;
    }

    // Xử lý khi modal được đóng (sau khi bấm "Lưu" hoặc "Huỷ")
    modalRef.result.then(
      (result) => {
        // Trường hợp đóng modal thành công (hàm activeModal.close(true) được gọi)
        if (result === true) {
          this.loadPage(this.currentPage); // Tải lại danh sách
        }
      },
      (reason) => {
        // Trường hợp modal bị dismiss (bấm "Huỷ" hoặc nút X)
        console.log('Modal dismissed:', reason);
      }
    );
  }
  selected(workspace:any){
    const body={id:workspace.id};
    this.workspaceService.connectWorkSpace(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        const authWs=res.body.body;
        localStorage.setItem("authWs",authWs);
        console.log(authWs);
        window.location.href="/";
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  getListCompany(){

  }
}
