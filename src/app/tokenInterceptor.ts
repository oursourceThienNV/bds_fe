import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

 private excludedUrls: string[] = [
  '/ws/',
  '/api/public/',
  '/register',
  '/login',
  '/assets/',
  '/upload/',
   '/task-manager/'
];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

const urlObj = new URL(request.url, window.location.origin);
const pathname = urlObj.pathname;

const shouldExcludeByPath = this.excludedUrls.some(ex => pathname.startsWith(ex));
const shouldExcludeByExtension =
  pathname.endsWith('.js') ||
  pathname.endsWith('.css') ||
  pathname.endsWith('.json');

const shouldExclude = shouldExcludeByPath || shouldExcludeByExtension;

if (shouldExcludeByPath) {
  console.log(`Bỏ qua Interceptor vì đường dẫn nằm trong excludedUrls: ${pathname}`);
} else if (shouldExcludeByExtension) {
  console.log(`Bỏ qua Interceptor vì file tĩnh có đuôi: ${pathname}`);
} else {
  console.log(`API bị chặn - được thêm token: ${pathname}`);
}

if (!shouldExclude) {
  const token = localStorage.getItem("authData");

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token
      }
    });
  }
}
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          alert('Tài khoản hoặc cửa hàng đã bị khóa không có quyền truy cập!');
          localStorage.removeItem('authData');
          sessionStorage.removeItem('authData');
          localStorage.removeItem('role');
          sessionStorage.removeItem('role');
          localStorage.removeItem('storeId');
          sessionStorage.removeItem('storeId');
          localStorage.removeItem('userId');
          sessionStorage.removeItem('userId');
          localStorage.removeItem('userName');
          sessionStorage.removeItem('userName');
          localStorage.removeItem('userAvatar');
          sessionStorage.removeItem('userAvatar');
          this.router.navigate(['/public/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
