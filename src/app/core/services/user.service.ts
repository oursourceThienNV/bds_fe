import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../models/auth.models';
import {ApiUrl} from "../../shared/constant/ApiUrl.constant";
import {Observable} from "rxjs";
import {createRequestOption} from "../../shared/util/request-util";
import { Login } from 'src/app/account/auth/login/login.model';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient, private api: ApiUrl) { }

    getAll() {
        return this.http.get<User[]>(`/api/login`);
    }
  public getAllUser(): Observable<any> {

    return this.http.post<any[]>(`${this.api.getCatalogApi()}/get-all-user`,{
      observe: 'response'
    });
  }
    findAll():  Observable<any> {
        return this.http.get(`${this.api.getCatalogApi()}/users/find-all`, {
          observe: 'response'
        });
    }
    findAllByCompanyId(body?: any):  Observable<any> {
       return this.http.post<any>(`${this.api.getCatalogApi()}/find-all-by-company-id`, body, {
      observe: 'response'
    });
    }

    register(user: User) {
        return this.http.post(`${this.api.getCatalogApi()}/register`, user, {
          observe: 'response'
        });
    }
    public findUserByGroupId(body?: any): Observable<any> {
      return this.http.post<any>(`${this.api.getCatalogApi()}/list-user-by-group-id`, body, {
        observe: 'response'
      });
    }
    public listUserWorkSpaceId(body?: any): Observable<any> {
      return this.http.post<any>(`${this.api.getCatalogApi()}/list-user-by-workspace-id`, body, {
        observe: 'response'
      });
    }


public search(body?: any): Observable<any> {
  return this.http.post<any[]>(`${this.api.getCatalogApi()}/user/on-search`, body,{
    observe: 'response'
  });
}



  public insertOrUpdate(id?: any, body?: any): Observable<any> {

      return this.http.post<any>(`${this.api.getCatalogApi()}/createUser`, body, {
        observe: 'response'
      });

  }
  public changePassword(body?: any): Observable<any> {

      return this.http.post<any>(`${this.api.getCatalogApi()}/change-pass-word`, body, {
        observe: 'response'
      });

  }
  public updateUser(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/update-user`, body, {
      observe: 'response'
    });

  }
  public findUserNoPassword(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/get-user-by-username`, body, {
      observe: 'response'
    });

  }

  public deleteMultiSelection(body?: any): Observable<any> {
    return this.http.post(`${this.api.getCatalogApi()}/delete`, body, {
      observe: 'response'
    });
  }


}
