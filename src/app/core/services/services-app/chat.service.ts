import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
import {Observable} from "rxjs";

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/chat-group/search`, body,{
      observe: 'response'
    });
  }
  public creatOrUpdateGroup(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/create-or-update`, body, {
      observe: 'response'
    });

  }
  public findIdByChatGroupId(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/find-list-by-chat-group-id`, body, {
      observe: 'response'
    });

  }
  public changeGroupName(body?:any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/change-group-name`, body, {
      observe: 'response'
    });
  }
  public deleteGroup(body?:any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/delete-group`, body, {
      observe: 'response'
    });
  }
  public chat(body?:any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/chat`, body, {
      observe: 'response'
    });
  }
  public listContent(body?:any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/chat-group/list-content`, body, {
      observe: 'response'
    });
  }
}
