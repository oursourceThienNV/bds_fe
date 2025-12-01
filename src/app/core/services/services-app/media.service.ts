import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/media/on-search`, body,{
      observe: 'response'
    });
  }
  uploadMedia(formData: FormData) {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/media/upload`, formData);
  }
  uploadMultiple(formData: FormData) {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/media/upload-multiple`, formData);
  }
}
