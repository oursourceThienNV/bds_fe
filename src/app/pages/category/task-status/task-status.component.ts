import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import { Page } from "src/app/core/models/page.model";
import {TaskStatusDialogComponent} from "./task-status-dialog.component";
import {TaskStatusServices} from "../../../core/services/services-app/task-status.service";
@Component({
  selector: 'app-group',
  templateUrl: './task-status.component.html'
})
export class TaskStatusComponent implements OnInit {
  role: any;
  tables: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  page = new Page();
  isLoading: boolean = false;
  workspaceId:any;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private taskStatusServices: TaskStatusServices,
  ) {}

  searchForm: FormGroup = this.fb.group({
    code: [null],
    name: [null],
    workSpaceId:[null],
    text:[null]
  });

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
    const authWs = localStorage.getItem('authWs');

    if (token) {
      const decoded: any = jwtDecode(token);
      this.role = decoded.role;
      if(authWs) {
        const decodedWs: any = jwtDecode(authWs);
        this.workspaceId = decodedWs.workSpaceId
        this.searchForm.get("workSpaceId").setValue(this.workspaceId);
      }
    }
    this.loadPage(0);
  }

  search() {
    this.loadPage(this.currentPage);
  }
  loadPage(page: number): void {
    this.isLoading = true;
    this.taskStatusServices.search({
      pageNumber: page,
      pageSize: 10,
      code: this.stringNullOrEmpty(this.searchForm.get("code")?.value)
        ? { contains: this.searchForm.get("code")?.value }
        : null,
      text: this.stringNullOrEmpty(this.searchForm.get("text")?.value)
        ? { contains: this.searchForm.get("text")?.value }
        : null,
      name: this.stringNullOrEmpty(this.searchForm.get("name")?.value)
        ? { contains: this.searchForm.get("name")?.value }
        : null,
      workSpaceId: this.stringNullOrEmpty(this.searchForm.get("workSpaceId")?.value)
        ? { equals: this.searchForm.get("workSpaceId")?.value }
        : null,

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
      const res = this.modalService.open(TaskStatusDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới thông tin"
      res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
}
  edit(table: any) {
    const res = this.modalService.open(TaskStatusDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Cập nhật thông tin";
    res.componentInstance.inputData=table;
    res.closed.subscribe(temp => {
        this.loadPage(this.currentPage)
      })
  }
}
