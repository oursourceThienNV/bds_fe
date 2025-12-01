import { Component, OnInit, Output, EventEmitter, Inject, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import {WebSocketService} from "../../core/services/services-app/WebSocketService";
import {ToastrService} from "ngx-toastr";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { jwtDecode } from 'jwt-decode';
import {UserProfileService} from "../../core/services/user.service";
import {UsersSidebarDialogComponent} from "../sidebar/users-sidebar-dialog.component";
import {ResetPasswordComponent} from "../../pages/category/users/reset-password/reset-password.component";

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {

  element;
  cookieValue;
  flagvalue;
  countryName;
  valueset;

  constructor(@Inject(DOCUMENT) private document: any, private router: Router,
              public languageService: LanguageService,public userService:UserProfileService,
              public translate: TranslateService,
              public _cookiesService: CookieService,private webSocketService: WebSocketService,private toast: ToastrService,private modalService: NgbModal,
              private hostEl: ElementRef) {
  }

  // Đóng dropdown khi click ra ngoài topbar
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    const rootEl = this.hostEl?.nativeElement as HTMLElement | undefined;
    const clickedInsideTopbar = rootEl && target ? rootEl.contains(target) : false;

    // Xác định nếu click nằm trong vùng dropdown của topbar
    let clickedInsideDropdown = false;
    if (clickedInsideTopbar && rootEl && target) {
      const dropdownAreas = rootEl.querySelectorAll('.dropdown, .dropdown-menu, .sidebar-user, .user-dropdown, .dropdown-sub');
      dropdownAreas.forEach((el) => {
        if (el.contains(target)) clickedInsideDropdown = true;
      });
    }

    // Đóng nếu click ngoài topbar hoặc click trong topbar nhưng KHÔNG thuộc vùng dropdown
    if (!clickedInsideTopbar || (clickedInsideTopbar && !clickedInsideDropdown)) {
      if (this.showDropdown) this.showDropdown = false;
      if (this.showGeneral) this.showGeneral = false;
      if (this.showSecurity) this.showSecurity = false;
    }
  }

  listLang = [
    {text: 'Việt Nam', flag: 'assets/images/flags/vietnam.png', lang: 'vi'},
    {text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en'},
    // { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    // { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    // { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    // { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  openMobileMenu: boolean;
  fullname = '';
  username = '';
  avatar = '';
  urlAvatar = false;
  showDropdown = false;
  logo: string | null = null; // Logo image URL, null nếu không có logo

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();
  workspace_code:any;
  workspace_name:any;
  isLoading: boolean = false;
  ngOnInit() {

    if(localStorage.getItem("authData")===""||localStorage.getItem("authData")===null||localStorage.getItem("authData")==="null"||localStorage.getItem("authData")===undefined){
      this.router.navigate(['/account/login']);
    }


    setInterval(() => {
      const token = localStorage.getItem('authData'); // hoặc lấy từ nơi bạn lưu trữ token
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000); // thời gian hiện tại tính bằng giây

        if (currentTime >= payload.exp) {
          localStorage.removeItem('authData');
          sessionStorage.removeItem('authData');
          this.router.navigate(['/account/login']);
          // Thực hiện hành động như logout, điều hướng về trang đăng nhập, gọi refresh token...
        } else {
          console.log('Token vẫn còn hiệu lực');
        }
      }
    }, 5000);
    if (localStorage.getItem('language')) {
      let lang = this.listLang.find(e => e.lang === localStorage.getItem('language'));
      if (lang) {
        this.setLanguage(lang.text, lang.lang, lang.flag)
      } else {
        lang = this.listLang.find(e => e.lang === 'vi');
      }
      this.setLanguage(lang.text, lang.lang, lang.flag)
    } else {
      const viLang = this.listLang.find(e => e.lang === 'vi');
      this.setLanguage(viLang.text, viLang.lang, viLang.flag)
    }
    this.openMobileMenu = false;
    this.element = document.documentElement;
    try {
      const token = localStorage.getItem('authData');
      if (token) {
        const decoded: any = jwtDecode(token);
        this.fullname = decoded.fullname || this.fullname;
        this.username = decoded.sub || decoded.username || this.username;
        this.avatar = decoded.avatar || this.avatar;
        this.urlAvatar = !!this.avatar;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fallback to JSON parse if token is not JWT
      try {
        const authRaw = localStorage.getItem('authData');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          this.fullname = auth.fullname || this.fullname;
          this.username = auth.username || auth.sub || this.username;
          this.avatar = auth.avatar || this.avatar;
          this.urlAvatar = !!this.avatar;
        }
      } catch (e) {}
    }

    // this.cookieValue = this._cookiesService.get('lang');
    // const val = this.listLang.filter(x => x.lang === this.cookieValue);
    // this.countryName = val.map(element => element.text);
    // if (val.length === 0) {
    //   if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
    // } else {
    //   this.flagvalue = val.map(element => element.flag);
    // }
//       const workspace=localStorage.getItem('workspace_id');
//      this.webSocketService.connect(Number(companyId));
//
//     // // Lắng nghe số liệu thống kê từ WebSocket
//     this.webSocketService.getStats().subscribe(stats => {
// debugger;
//       if (stats) {
//         debugger;
//         // Cập nhật số lượng thông báo chưa đọc (ví dụ, số lượng đơn hàng chưa xử lý)
//         this.unreadNotifications = stats;
//         if (this.unreadNotifications > 0) {
//           // this.create();
//           // Gọi chức năng rung
//           this.triggerVibration();
//         }
//       }
//     });
  }

  triggerVibration() {
    // Kiểm tra xem thiết bị có hỗ trợ rung không
    if ("vibrate" in navigator) {
      // Rung 500ms, sau đó dừng (Có thể thay đổi thời gian rung và mẫu rung)
      navigator.vibrate(5000);  // 500ms
    } else {
      console.log('Thiết bị không hỗ trợ rung');
    }
  }
  openNotifications() {
    console.log('Chuông được nhấn');
    // Mở modal hoặc làm gì đó khi người dùng nhấn vào chuông
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    localStorage.setItem("authData","");
    this.router.navigate(['/account/login']);
  }
  unreadNotifications: number = 0;
  showGeneral = false;
  showSecurity = false;

  toggleDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showDropdown = !this.showDropdown;
  }

  toggleGeneral(event: any) {
    event.stopPropagation();
    this.showGeneral = !this.showGeneral;
  }

  toggleSecurity(event: any) {
    event.stopPropagation();
    this.showSecurity = !this.showSecurity;
  }
  changePassWord(){
    const res = this.modalService.open(ResetPasswordComponent, {size: 'lg', centered: true});
    const user={username:this.username}
    res.componentInstance.title = "Cập nhật password"
    res.componentInstance.inputData = user;

    // res.componentInstance.inputData = table;
  }
  updateProfile() {
    this.isLoading==true;
    const body={
      username:this.username
    }
    this.userService.findUserNoPassword(body).subscribe({
      next: (resb) => {
        if (resb?.body?.responseCode === '200') {
          this.isLoading=false;
          const res = this.modalService.open(UsersSidebarDialogComponent, {size: 'lg', centered: true});
          res.componentInstance.inputData = resb?.body?.body;
        } else {
          this.isLoading=false;
          console.error('Lỗi lấy dữ liệu tổ chức:', resb?.responseMessage);
        }
      },
      error: (err) => console.error('Lỗi kết nối:', err)
    });

  }
  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
}
