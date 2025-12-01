import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class GroupTeamService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/group-team/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/group-team/create-or-update`, body, {
      observe: 'response'
    });

  }
   public findAllByCompanyId(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/group-team/list-all-group-by-company-or-group`, body, {
      observe: 'response'
    });
  }
  public findAllByGroupMain(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/group-team/list-all-by-group-main`, body, {
      observe: 'response'
    });
  }
  public findGroupTeamViewByCompanyId(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/group-team/list-group-team-view-by-group-or-comapny`, body, {
      observe: 'response'
    });
  }
}
