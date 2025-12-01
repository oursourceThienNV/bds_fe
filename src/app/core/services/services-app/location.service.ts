import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class LocationServices {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public listProvince(): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/location/list-province`,{
      observe: 'response'
    });
  }
  public listDistrict(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/location/list-district`, body, {
      observe: 'response'
    });

  }
  public listWard(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/location/list-ward`, body, {
      observe: 'response'
    });

  }
}
