import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, of } from 'rxjs';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import {environment} from "../../../environments/environment";
import {ApiUrl} from "../../shared/constant/ApiUrl.constant";


@Injectable({ providedIn: 'root' })
export class AccountService {
  private userIdentity: any | null = null;
  private authenticationState = new ReplaySubject<any | null>(1);
  private accountCache$?: Observable<any> | null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private api: ApiUrl
  ) {}

  authenticate(identity: any | null): void {
    this.userIdentity = identity;
    this.authenticationState.next(this.userIdentity);
    if (!identity) {
      this.accountCache$ = null;
    }
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    if (!this.userIdentity) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.userIdentity.authorities.some((authority: string) => authorities.includes(authority));
  }

  identity(force?: boolean): Observable<any | null> {
  if (!this.accountCache$ || force) {
    this.accountCache$ = of(null).pipe(shareReplay());
  }
  return this.accountCache$.pipe(catchError(() => of(null)));
}

  isAuthenticated(): boolean {
    return this.userIdentity !== null;
  }

  getAuthenticationState(): Observable<any | null> {
    return this.authenticationState.asObservable();
  }

  private fetch(): Observable<any> {
    
    return this.http.post<any>(`${this.api.getCatalogApi()}/user/get-user-info`,{
      observe: 'response'
    });
  }
  
}
