import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
import {Observable} from "rxjs";

@Injectable({ providedIn: 'root' })
export class LicenseService {
  constructor(private http: HttpClient, private api: ApiUrl) {
  }

  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/key-access/on-search`, body, {
      observe: 'response'
    });
  }

  public insertOrUpdate(id?: any, body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/key-access/create-or-update`, body, {
      observe: 'response'
    });

  }
  public send(id?: any, body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/key-access/send`, body, {
      observe: 'response'
    });

  }
}
