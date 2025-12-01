import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class TaskStatusServices {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/task-status/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task-status/create-or-update`, body, {
      observe: 'response'
    });

  }
  public listTaskStatusByWorkSpaceId(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task-status/list-all-by-workspace-id`, body, {
      observe: 'response'
    });

  }
}
