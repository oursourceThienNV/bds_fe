import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


import { environment } from '../../../environments/environment';
import {AccountService} from "../../account/auth/account.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService,

    ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const token = localStorage.getItem('authData');

    if (!token) {
      this.router.navigate(['/public/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Nếu cần thêm kiểm tra token hợp lệ (hết hạn, decode...), có thể thêm ở đây

    return true;
  }

}
