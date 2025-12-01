import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  HostListener // Import HostListener
} from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { MENU_ADMIN, MENU_COMPANY, MENU_GROUP, MENU_PERSON, MENU_WORKSPACE } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { ACCOUNT_TYPE, ROLE } from "../../pages/category/Contants";
import { jwtDecode } from 'jwt-decode';
import { UsersDialogComponent } from "../../pages/category/users/users-dialog/users-dialog.component";
import { UserProfileService } from "../../core/services/user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UsersSidebarDialogComponent } from "./users-sidebar-dialog.component";
import { ResetPasswordComponent } from "../../pages/category/users/reset-password/reset-password.component";
import { ApiUrl } from "../../shared/constant/ApiUrl.constant";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef: any;
  @Input() isCondensed = false;

  menu: any;
  data: any;
  isLoading: boolean = false;
  menuItems: MenuItem[] = [];

  workspace_code: any;
  workspace_name: any;
  workspace_id: any;

  @ViewChild('sideMenu') sideMenu!: ElementRef;

  username: any;
  fullname: any;
  user: any;
  avatar: any;
  urlAvatar: any;

  showDropdown = false;
  isSidebarOpen: boolean = false; // New property for sidebar state

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Close sidebar if screen size is larger than mobile breakpoint (e.g., 768px)
    if (event.target.innerWidth > 767.98 && this.isSidebarOpen) {
      this.isSidebarOpen = false;
      // restore body scroll when leaving mobile view
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    // Ưu tiên kiểm tra cả root component thay vì chỉ sideMenu
    const rootEl = this.hostEl?.nativeElement as HTMLElement | undefined;
    const clickedInsideRoot = rootEl && target ? rootEl.contains(target) : false;
    if (!clickedInsideRoot && this.showDropdown) {
      this.showDropdown = false;
    }
  }

  constructor(
    private eventService: EventService,
    private router: Router,
    public translate: TranslateService,
    private http: HttpClient,
    private modalService: NgbModal,
    private api: ApiUrl,
    public userService: UserProfileService,
    private hostEl: ElementRef
  ) {
    // Theo dõi điều hướng để auto scroll tới mục đang active
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    const authWs = localStorage.getItem('authWs');
    if (authWs) {
      const decodedWs: any = jwtDecode(authWs);
      this.workspace_code = decodedWs.workSpaceCode;
      this.workspace_name = decodedWs.workSpaceName;
      this.workspace_id = decodedWs.workSpaceId;
    }

    const token = localStorage.getItem('authData');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.username = decoded.sub;
      this.fullname = decoded.fullname;
      this.avatar = `${this.api.getCatalogApi()}` + decoded.avatar;
      this.urlAvatar = decoded.avatar;
    }

    this.initialize();
    this._scrollElement();
  }

  removeWorkspace() {
    localStorage.removeItem("authWs");
    window.location.href = "/";
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    // lock/unlock body scroll on mobile when sidebar toggles
    const isMobile = window.innerWidth <= 767.98;
    if (isMobile) {
      document.body.style.overflow = this.isSidebarOpen ? 'hidden' : '';
    }
  }

  updateProfile() {
    this.isLoading == true;
    const body = { username: this.username };
    this.userService.findUserNoPassword(body).subscribe({
      next: (resb) => {
        if (resb?.body?.responseCode === '200') {
          this.isLoading = false;
          this.user = resb?.body;
          const res = this.modalService.open(UsersSidebarDialogComponent, { size: 'lg', centered: true });
          res.componentInstance.inputData = this.user.body;
        } else {
          this.isLoading = false;
          console.error('Lỗi lấy dữ liệu tổ chức:', resb?.responseMessage);
        }
      },
      error: (err) => console.error('Lỗi kết nối:', err)
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/account/login']);
  }

  ngAfterViewInit() {
    // Khởi tạo MetisMenu để xử lý expand/collapse khi click
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
  }

  changePassWord() {
    const res = this.modalService.open(ResetPasswordComponent, { size: 'lg', centered: true });
    const user = { username: this.username }
    res.componentInstance.title = "Cập nhật password"
    res.componentInstance.inputData = user;
  }

  toggleMenu(event: any) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if ((!this.isCondensed && this.sideMenu) || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }

  private _scrollElement() {
    setTimeout(() => {
      const actives = document.getElementsByClassName("mm-active");
      if (actives.length > 0) {
        const currentPosition = (actives[0] as any)['offsetTop'];
        if (currentPosition > 500 && this.scrollRef && this.scrollRef.SimpleBar !== null) {
          this.scrollRef.SimpleBar.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    }, 300);
  }

  private _removeAllClass(className: string) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  initialize(): void {
    const token = localStorage.getItem('authData');
    const decoded: any = jwtDecode(token || '');
    const accountType = decoded.accountType;
    const role = decoded.role;

    const workspace = localStorage.getItem('authWs');
    if (workspace) {
      this.menuItems = MENU_WORKSPACE;
    } else {
      if (accountType === ACCOUNT_TYPE.COMPANY) {
        this.menuItems = MENU_COMPANY;
      } else if (accountType === ACCOUNT_TYPE.GROUP) {
        this.menuItems = MENU_GROUP;
      } else if (accountType === ACCOUNT_TYPE.PERSON) {
        this.menuItems = MENU_PERSON;
      } else if (role === ROLE.ADMIN) {
        this.menuItems = MENU_ADMIN;
      } else {
        this.menuItems = [];
      }
    }
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /** URL hiện tại có khớp link này không (hỗ trợ cả /path?query) */
  isLinkActive(link?: string): boolean {
    if (!link) return false;
    const url = this.router.url || '';
    return url === link || url.startsWith(link + '/') || url.startsWith(link + '?');
  }

  /** Bất kỳ con nào của item đang active để tự mở submenu */
  isAnyChildActive(item: MenuItem): boolean {
    if (!item?.subItems?.length) return false;
    return item.subItems.some(c => this.isLinkActive(c.link));
  }
}
