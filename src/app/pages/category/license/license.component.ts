import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Page} from "../../../core/models/page.model";
import {TranslateService} from "@ngx-translate/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpHeaders} from "@angular/common/http";
import Swal from "sweetalert2";
import * as fileSaver from 'file-saver';
import {buildUnitTree} from "../../../core/utils/common";
import {UserProfileService} from "../../../core/services/user.service";
import {COMMON_STATUS, LICENSE_STATUS, LICENSE_TYPE, ROLE} from "../Contants";
import {LicenseDialogComponent} from "./license-dialog.component";
import { jwtDecode } from 'jwt-decode';
import {LicenseService} from "../../../core/services/services-app/license.service";
import {CompanyService} from "../../../core/services/services-app/company.service";
@Component({
  selector: 'app-users',
  templateUrl: './license.component.html'
})
export class LicenseComponent implements OnInit {
  // @ts-ignore
  ROLE = ROLE;
  LICENSE_STATUS = LICENSE_STATUS;
  searchForm: FormGroup = this.fb.group({
    keyValue: [null],
    status: [""],
    companyId:[""]
  });
  tables: any = [];
  page = new Page();
  role: any;
  totalPages: number = 0;
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  listStore:any;
  isLoading:boolean=false;
  constructor(private fb: FormBuilder,
              private licenseService: LicenseService,
              private translateService: TranslateService,
              public companyService: CompanyService,
              private modalService: NgbModal) {
  }
  ngOnInit(): void {
    const token = localStorage.getItem('authData');
if (token) {
  const decoded: any = jwtDecode(token); // ✅ không cần token || ''
  this.role = decoded.role;
}
    this.loadPage(0)
    this.getListStore();
  }

  search() {
    this.loadPage(0);
  }

  protected onSuccess(data: any | null): void {
    var jso = JSON.stringify(data.body.page.content);
    this.tables=data?.body?.page?.content;
    this.totalPages = data.body.page.totalPages;
    this.totalElements = data.body.page.totalElements;
    this.currentPage = data.body.page.currentPage;
    this.isLoading=false;
  }
  labelType={
    [LICENSE_TYPE.ONE_MONTH]:'1 tháng',
    [LICENSE_TYPE.SIX_MONTHS]:'6 tháng',
    [LICENSE_TYPE.THREE_MONTHS]:'3 tháng',
    [LICENSE_TYPE.ONE_YEAR]:'1 năm',
  }
  labelStatus={
    [LICENSE_STATUS.NOT_USED]:'Chưa sử dụng',
    [LICENSE_STATUS.USED]:'Đã áp dụng',
    [LICENSE_STATUS.SENT]:'Đã gửi khách hàng'
  }

  loadPage(page: number): void {
    this.isLoading=true;
    this.licenseService.search({
      pageNumber: page,
      pageSize: 10,
      keyValue:this.stringNullOrEmpty(this.searchForm.get("keyValue").value)? {contains:this.searchForm.get("keyValue").value}:null,
      status:this.stringNullOrEmpty(this.searchForm.get("status").value)? {contains:this.searchForm.get("status").value}:null,
      companyId:this.stringNullOrEmpty(this.searchForm.get("companyId").value)? {equals:this.searchForm.get("companyId").value}:null,
    }).subscribe(res => this.onSuccess(res.body));
  }

  getListStore(){
    this.companyService.getAll().subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listStore = res.body.body;
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }

  create() {
    const res = this.modalService.open(LicenseDialogComponent, {size: 'lg', centered: true});
    res.componentInstance.title = this.translateService.instant('Thêm mới license');
    res.componentInstance.listStore=this.listStore;
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }
  edit(table) {
    const res = this.modalService.open(LicenseDialogComponent, {size: 'lg', centered: true});
    res.componentInstance.title = this.translateService.instant('Cập nhật license');
    res.componentInstance.inputData = table;
    res.componentInstance.role=this.role;
    res.componentInstance.checkAction = "E";
    res.componentInstance.listStore=this.listStore;
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }
  send(table) {
    const res = this.modalService.open(LicenseDialogComponent, {size: 'lg', centered: true});
    res.componentInstance.title = this.translateService.instant('Gửi license cho khách hàng');
    res.componentInstance.inputData = table;
    res.componentInstance.role=this.role;
    res.componentInstance.checkAction = "S";
    res.componentInstance.listStore=this.listStore;
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }
  stringNullOrEmpty(value: any){
    if(value===""||value===null||value==undefined){
      return false;
    }else{
      return true;
    }
  }

}

