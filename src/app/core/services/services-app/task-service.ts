import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class TaskServices {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/task/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/create-or-update`, body, {
      observe: 'response'
    });

  }
  public listTaskStatusByWorkSpaceId(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/list-all-by-workspace-id`, body, {
      observe: 'response'
    });

  }
  public findById(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/list-all-by-id`, body, {
      observe: 'response'
    });

  }
  public getHC(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/board-hc`, body, {
      observe: 'response'
    });

  }
  public getBoard(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/board`, body, {
      observe: 'response'
    });

  }
  public changeStatus(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/change-status`, body, {
      observe: 'response'
    });

  }
  public changeTask(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/change-task`, body, {
      observe: 'response'
    });

  }
  public requesApprove(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/request-approve`, body, {
      observe: 'response'
    });

  }
  public requesEdit(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/request-edit`, body, {
      observe: 'response'
    });

  }
  public completeAll(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task/done-all`, body, {
      observe: 'response'
    });

  }

}
