import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {EventManager, EventWithContent} from "./event-manager.service";
import {Router} from "@angular/router";
import {LoginService} from "../../account/auth/login/login.service";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private eventManager: EventManager,
  private loginService: LoginService, private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        error: (err: HttpErrorResponse) => {
          // if (!(err.status === 401 && (err.message === ''))) {
          //   this.eventManager.broadcast(new EventWithContent('boc.error', err));
          // }
          if(err.status === 401) {
            this.loginService.logout();
          }
        },
      })
    );
  }
}
