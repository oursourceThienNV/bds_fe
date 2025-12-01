import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Page } from "../../../core/models/page.model";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HttpHeaders } from "@angular/common/http";
import Swal from "sweetalert2";
import * as fileSaver from "file-saver";
import { buildUnitTree } from "../../../core/utils/common";
import { UserProfileService } from "../../../core/services/user.service";
// import {UsersDialogComponent} from "./users-dialog/users-dialog.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { UsersDialogComponent } from "./users-dialog/users-dialog.component";
import { UserSearch } from "./user.search.model";
import { ACCOUNT_TYPE, COMMON_STATUS, ROLE } from "../Contants";
import { jwtDecode } from "jwt-decode";
import { CompanyService } from "src/app/core/services/services-app/company.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  // @ts-ignore
  ROLE = ROLE;
  COMMON_STATUS = COMMON_STATUS;
  ACCOUNT_TYPE = ACCOUNT_TYPE;
  breadCrumbItems = [
    { label: "menu.sysMng" },
    { label: "Quản lý đội nhóm", active: true },
  ];

  searchForm: FormGroup = this.fb.group({
    username: [null],
    fullname: [null],
    status: [""],
    phone: [null],
    role: [""],
    companyId: [""],
  });
  isLoading: boolean = false;
  lstProductType: any = [];
  lstGroup: any = [];
  lstDepts = [];
  lstStatus: any = [];
  tables: any = [];
  selectedAll: boolean = false;
  page = new Page();
  searchModel: any;
  userSearch: any;
  role: any;
  accountType: any;
  totalPages: number = 0;
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  listCompany: any;
  companyId: any;
  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private translateService: TranslateService,
    private companyService: CompanyService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    const token = localStorage.getItem("authData");
    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
      this.accountType = decoded.accountType;
      this.companyId = decoded.companyId;
    }
    this.getListCompany();
    this.loadPage(0);
  }

  search() {
    console.log("aaa", this.searchForm.get("username").value);
    this.loadPage(0);// reset page to 0
  }
  customSearchFn(term: string, item: any): boolean {
    const keyword = term.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.phone?.toLowerCase().includes(keyword)
    );
  }

  protected onSuccess(data: any | null): void {
    var jso = JSON.stringify(data.body.page.content);
    this.tables = data?.body?.page?.content;
    this.totalPages = data.body.page.totalPages;
    this.totalElements = data.body.page.totalElements;
    this.currentPage = data.body.page.currentPage;
  }
  roleLabelMap = {
    [ROLE.ADMIN]: "Admin",
    [ROLE.ADMIN_COMPANY]: "Owner",
    [ROLE.NHAN_VIEN]: "Nhân viên",
  };
  labelStatus = {
    [COMMON_STATUS.ACTIVE]: "Đang hoạt động",
    [COMMON_STATUS.INACTIVE]: "Vô hiệu hóa",
  };
  labelAccountType = {
    [ACCOUNT_TYPE.COMPANY]: "Công ty",
    [ACCOUNT_TYPE.GROUP]: "Nhóm",
    [ACCOUNT_TYPE.PERSON]: "Cá nhân",
  };

  loadPage(page: number): void {
    this.isLoading = true;
    this.userProfileService
      .search({
        pageNumber: page,
        pageSize: 10,
        username: this.stringNullOrEmpty(this.searchForm.get("username").value)
          ? { contains: this.searchForm.get("username").value }
          : null,
        fullname: this.stringNullOrEmpty(this.searchForm.get("fullname").value)
          ? { contains: this.searchForm.get("fullname").value }
          : null,
        phone: this.stringNullOrEmpty(this.searchForm.get("phone").value)
          ? { contains: this.searchForm.get("phone").value }
          : null,
        status: this.stringNullOrEmpty(this.searchForm.get("status").value)
          ? { contains: this.searchForm.get("status").value }
          : null,
        companyId: this.stringNullOrEmpty(
          this.searchForm.get("companyId").value
        )
          ? { equals: this.searchForm.get("companyId").value }
          : null,
      })
      .subscribe({
        next: (res) => {
          this.onSuccess(res.body);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  stringNullOrEmpty(value: any) {
    if (value === "" || value === null || value == undefined) {
      return false;
    } else {
      return true;
    }
  }
  export() {
    // this.userProfileService.export(this.searchForm.value).subscribe(res => {
    //   Swal.fire({
    //     position: 'top-end',
    //     icon: 'success',
    //     width: '20em',
    //     title: this.translateService.instant('alert.success-download'),
    //     showConfirmButton: false,
    //     timer: 1500
    //   });
    //   const name = res.headers.get('filename');
    //   const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    //   this.saveFile(res.body, name, contentType);
    // });
  }
  saveFile(data: any, filename?: string, contentType?: string) {
    const blob = new Blob([data], { type: contentType });
    fileSaver.saveAs(blob, filename);
  }

  selectAllChange() {
    this.tables = this.tables.map((e) => {
      e["selected"] = this.selectedAll;
      return e;
    });
  }
  deleteCheck(tables: any) {
    if (tables.filter((e) => e.selected === true).length === 0) {
      return true;
    } else return false;
  }

  // changePage(page) {
  //   if (page) {
  //     this.setPage({offset: page - 1})
  //   }
  // }

  create() {
    const res = this.modalService.open(UsersDialogComponent, {
      size: "lg",
      centered: true,
    });
    res.componentInstance.title =
      this.translateService.instant("users.create_title");
    res.componentInstance.listCompany = this.listCompany;
    res.componentInstance.companyId = this.companyId;
    res.closed.subscribe((temp) => {
     this.loadPage(0);
    });
  }
  getListCompany() {
    this.companyService.getAll().subscribe(
      (res) => {
        if (res && res.body.responseCode === "200") {
          // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
          this.listCompany = res.body.body;
        } else {
          console.error("Lỗi lấy danh sách cửa hàng:", res.responseMessage);
        }
      },
      (error) => {
        console.error("Lỗi kết nối đến server:", error);
      }
    );
  }
  edit(table) {
    const res = this.modalService.open(UsersDialogComponent, {
      size: "lg",
      centered: true,
    });
    res.componentInstance.title =
      this.translateService.instant("users.update_title");
    res.componentInstance.inputData = table;
    res.componentInstance.listCompany = this.listCompany;
    res.componentInstance.role = this.role;
    res.componentInstance.companyId = this.companyId;
    res.closed.subscribe((temp) => {
      this.loadPage(this.currentPage);
    });
  }

  resetPassword(table) {
    const res = this.modalService.open(ResetPasswordComponent, {
      size: "lg",
      centered: true,
    });
    res.componentInstance.title = this.translateService.instant(
      "users.reset_password_title"
    );
    res.componentInstance.inputData = table;
    res.closed.subscribe((temp) => {
      this.loadPage(this.currentPage);
    });
  }

  delete() {
    let deleteRows = this.tables.filter((e) => e.selected === true);
    if (deleteRows === null) {
      return;
    }
    deleteRows = deleteRows.map((res) => res.id);
    Swal.fire({
      title: this.translateService.instant("common.confirm"),
      text: this.translateService.instant(
        "map_cluster_location.delete-confirm"
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#34c38f",
      cancelButtonColor: "#f46a6a",
      confirmButtonText: this.translateService.instant("common.button.confirm"),
      cancelButtonText: this.translateService.instant("common.button.cancel"),
    }).then((result) => {
      if (result.value) {
        this.userProfileService.deleteMultiSelection(deleteRows).subscribe(
          (res) => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: this.translateService.instant(
                "common.message.delete-success"
              ),
              showConfirmButton: false,
              timer: 3000,
            });
            this.loadPage(this.currentPage);
            this.selectedAll = false;
          },
          (error) => {
            Swal.fire({
              position: "top-end",
              icon: "error",
              title: error.error.message,
              showConfirmButton: false,
              timer: 3000,
            });
          }
        );
      }
    });
  }
}
