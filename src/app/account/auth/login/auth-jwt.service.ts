// import {Injectable} from '@angular/core';
// import {HttpClient, HttpHeaders} from '@angular/common/http';
// import {Observable} from 'rxjs';
// import {map} from 'rxjs/operators';
// import {Login} from "./login.model";
// import {environment} from "../../../../environments/environment";
// import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";
//
//
// type JwtToken = {
//   jwt: string;
//   role:string;
//   storeId:string;
// };
//
// @Injectable({providedIn: 'root'})
// export class AuthServerProvider {
//   constructor(
//     private http: HttpClient, private api: ApiUrl
//   ) {
//   }
//
//   getToken(): string {
//     const tokenInLocalStorage: string | null = localStorage.getItem('jwt');
//     const tokenInSessionStorage: string | null = sessionStorage.getItem('jwt');
//     return tokenInLocalStorage ?? tokenInSessionStorage ?? '';
//   }
//
//   login(credentials: Login): Observable<void> {
//
//     // var headers_object = new HttpHeaders({
//     //   'Content-Type': 'application/json',
//     //   'Authorization': "Basic " + btoa("demo-client:123456a@")
//     // });
//     // headers_object.set('Content-Type', 'application/json');
//     // headers_object.set("Authorization", "Basic " + btoa("demo-client:123456a@"));
//
//     // const httpOptions = {
//     //   headers: headers_object
//     // };
//
//     return this.http
//       .post<JwtToken>(`${this.api.getAuthApi()}`, credentials)
//       .pipe(map(response => this.authenticateSuccess(response)));
//   }
//

//
//   private authenticateSuccess(response: JwtToken): void {
//     localStorage.setItem('authData', response.jwt);
//     localStorage.setItem('jwt', response.jwt);
//     localStorage.setItem('role', response.role);
//     localStorage.setItem('storeId',response.storeId);
//
//   }
// }
