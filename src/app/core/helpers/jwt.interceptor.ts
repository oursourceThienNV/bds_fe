import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {CookieService} from "ngx-cookie-service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url || (request.url.startsWith('http') && request.url.includes("/api/authenticate"))) {
      return next.handle(request);
    }
    const token: string | null = localStorage.getItem('authData');
    // const lang: string | null = localStorage.getItem('language');
    const lang: string | null = this.cookieService.get('lang');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang === null || lang === undefined ? 'vi' : lang
        },
      });
    }
    return next.handle(request);
  }
}
