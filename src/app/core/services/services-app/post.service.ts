import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/post/on-search`, body,{
      observe: 'response'
    });
  }

  public insertOrUpdate(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/post/create-or-update`, body, {
      observe: 'response'
    });
  }

  public detail(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/post/detail`, body, {
      observe: 'response'
    });
  }
}
