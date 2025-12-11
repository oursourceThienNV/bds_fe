import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/company/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/company/create-or-update`, body, {
      observe: 'response'
    });

  }
   public getAll(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/company/list-all`, body, {
      observe: 'response'
    });
  }
  public applyKey(id?: any, body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/company/apply-key`, body, {
      observe: 'response'
    });

  }

  public getListCompanyByUserId(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/company/get-list-company-by-userId`, body, {
      observe: 'response'
    });
  }

  public getCompanyById(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/company/get-company-by-id`, body, {
      observe: 'response'
    });
  }
}
