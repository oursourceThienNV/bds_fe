import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class CommonCodeServices {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/common-code/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/common-code/create-or-update`, body, {
      observe: 'response'
    });

  }
  public listCommonByWorkSpaceId(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/common-code/list-all-by-work-space-id`, body, {
      observe: 'response'
    });

  }

  public listAllByType(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/common-code/list-all-by-type`, body, {
      observe: 'response'
    });

  }
}
