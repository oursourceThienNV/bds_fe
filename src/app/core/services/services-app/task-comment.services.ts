import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class TaskCommentServices {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public create(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/task-comment/create`, body, {
      observe: 'response'
    });

  }
}
