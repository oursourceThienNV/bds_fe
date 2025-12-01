import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import {environment} from '../../../environments/environment';


// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor() {}
//
//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!request || !request.url || (request.url.startsWith('http') && !(environment.apiUrl && request.url.startsWith(environment.apiUrl))
//       && !(environment.apiUrl && request.url.startsWith(environment.apiUrl)))) {
//       return next.handle(request);
//     }
//
//     const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsib3JkZXJfc2VydmljZSIsImN1c3RvbWVyLXNlcnZpY2UiLCJjYXRhbG9nLXNlcnZpY2UiLCJ2aXNpdC1zZXJ2aWNlIiwic2FnYV9zZXJ2aWNlIl0sImV4cCI6MTY0NzE1MjM2OCwidXNlcl9uYW1lIjoiYWRtaW4iLCJqdGkiOiJjZTlkZGI4YS1iOWMwLTRmNjYtYjczYS04MmU3MDI2YzM0NWEiLCJjbGllbnRfaWQiOiJkZW1vLWNsaWVudCIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdfQ.WNU2JxrB2IPTYeGH5SRaKFYcEweyDy2bI6pU_KEtqs0pv1YZLkLIyeDSaCrH1fRIpTZOCqZQFP8tOi1ayP3s775ugoKUBy4zB7qXNRRwLxxZakY5fsC4k-nRiMC-q8dxo58c0dHVExWlgbeBO1nu7u35WLwjgm5LMsXGfwBq2jQQzgPzqDS0Cj7g29n2rTCCCBIDT4W5-BXNkq6wF5x38NFL4wpMoQUaliMki3EbljnkrOfvF4YPg_4mq1s-LKDwBsG1jO3nSxmZMYL1hv-ImFaUxkKGH-m8fblJ2GuJOvlCPl0_DSWbZJA7SzXr4htXoO9XlWwJUeKmdMWLbcMCTw";
//     if (token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: 'Bearer ' + token,
//           'Accept-Language': 'vi'
//         }
//       });
//     } else {
//       request = request.clone({
//         setHeaders: {
//           'Accept-Language': 'vi'
//         }
//       });
//     }
//     return next.handle(request);
//   }
// }
