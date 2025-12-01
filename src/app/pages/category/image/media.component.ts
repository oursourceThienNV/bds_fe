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
import {MediaService} from "../../../core/services/services-app/media.service";
import {MediaDialogComponent} from "./media-dialog.component";
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-users',
  templateUrl: './media.component.html',
})
export class MediaComponent implements OnInit {

  breadCrumbItems = [{label: 'menu.sysMng'}, {label: 'users.title', active: true}];
  tables: any = [];
  selectedAll: boolean = false;
  page = new Page();
  role: any;
  totalPages: number = 0;
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  constructor(private fb: FormBuilder,
              private mediaService: MediaService,
              private translateService: TranslateService,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
       const token = localStorage.getItem('authData');
    if (token) {
      const decoded: any = jwtDecode(token); // ✅ không cần token || ''
      this.role = decoded.role;
    }
    this.loadPage(0);
  }

  search() {
    this.loadPage(this.currentPage);
  }

  protected onSuccess(data: any | null): void {
    var jso = JSON.stringify(data.body.page.content);
    this.tables=data?.body?.page?.content;
    this.totalPages = data.body.page.totalPages;
    this.totalElements = data.body.page.totalElements;
    this.currentPage = data.body.page.currentPage;

  }
  loadPage(page: number): void {
    this.mediaService.search({
      pageNumber: page,
      pageSize: 10,
    }).subscribe(res => this.onSuccess(res.body));
  }
  create() {
    const res = this.modalService.open(MediaDialogComponent, {size: 'lg', centered: true});
    res.componentInstance.title = 'Upload file';
    res.closed.subscribe(temp => {
      this.loadPage(this.currentPage)
    })
  }
}

