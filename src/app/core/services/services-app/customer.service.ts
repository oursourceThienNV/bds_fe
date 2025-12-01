import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private http: HttpClient, private api: ApiUrl) { }
  public search(body?: any): Observable<any> {
    return this.http.post<any[]>(`${this.api.getCatalogApi()}/api/customer/search`, body,{
      observe: 'response'
    });
  }
  public insertOrUpdate(body?: any): Observable<any> {

    return this.http.post<any>(`${this.api.getCatalogApi()}/api/customer/create-or-update`, body, {
      observe: 'response'
    });

  }
  public getAll(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/customer/list-customer-by-workspace-id`, body, {
      observe: 'response'
    });
  }
  public searchRelationShip(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/customer/find-relation-ship-customer-by-id`, body, {
      observe: 'response'
    });
  }
  public findById(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/customer/find-customer-by-id`, body, {
      observe: 'response'
    });
  }
  public getCalendar(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/calendar/list`, body, {
      observe: 'response'
    });
  }
  public createCalendar(body?: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/calendar/create`, body, {
      observe: 'response'
    });
  }
  public getAllCustomersInWorkspace(body: any): Observable<any> {
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/customer/list-customer-by-workspace-id`, body, {
      observe: 'response'
    });
  }
  public getCustomerGroups(body: any): Observable<any> {

  
    return this.http.post<any>(`${this.api.getCatalogApi()}/api/common-code/list-all-by-work-space-id-and-type`, body, {
      observe: 'response'
    });
  }
// public getCustomersByGroupId(workSpaceId: any, groupId: any): Observable<any> {
    
   
//     const body = {
//       pageNumber: 0,
//       pageSize: 1000, 
      
      
//       workSpaceId: { equals: +workSpaceId }, 
//       nhomKh: { equals: groupId } 
//     };

//     return this.http.post<any>(
//       `${this.api.getCatalogApi()}/api/common-code/list-all-by-work-space-id-and-type`, 
//       body, 
//       { observe: 'response' }
//     );
//   }
}
