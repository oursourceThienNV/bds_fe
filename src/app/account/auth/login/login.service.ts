import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {AccountService} from "../account.service";
import {Login} from "./login.model";
// import {AuthServerProvider} from "./auth-jwt.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
interface JwtToken {
  jwt: string; // hoặc access_token nếu backend dùng tên này
  role:string;
  storeId:string;
}
@Injectable({providedIn: 'root'})
export class LoginService {
  constructor(private accountService: AccountService,
              // private authServerProvider: AuthServerProvider,
              private http: HttpClient, private api: ApiUrl,
              private router: Router) {
  }

  login(credentials: Login): Observable<void> {
    return this.http
      .post<JwtToken>(`${this.api.getAuthApi()}`, credentials)
      .pipe(map(response => this.authenticateSuccess(response)));
  }

  private authenticateSuccess(response: JwtToken): void {
    if(response.jwt!=null) {
      localStorage.setItem('authData', response?.jwt);
    }else {
      alert("Tài khoản và mật khẩu không đúng, vui lòng thử lại sau");
    }
  }


  resetPassword(email: string) {
    return this.http.post(this.api.getCatalogApi() + '/account/reset-password/init', email);
  }

    logout(): Observable<void> {
    return new Observable(observer => {
      localStorage.removeItem('authData');
      sessionStorage.removeItem('authData');
      localStorage.removeItem('role');
      sessionStorage.removeItem('role');
      localStorage.removeItem('storeId');
      sessionStorage.removeItem('storeId');
      observer.complete();
    });
  }
}
