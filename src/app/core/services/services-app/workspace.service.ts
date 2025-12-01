import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/workspace/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/workspace/create-or-update`, body, {
      observe: 'response'
    });

  }
  public findDetailById(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/workspace/find-workspace-by-id
`, body, {
      observe: 'response'
    });
  }
  public connectWorkSpace(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/workspace/connect-workspace
`, body, {
      observe: 'response'
    });
  }
}
