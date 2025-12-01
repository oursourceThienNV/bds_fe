import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({providedIn: 'root'})
export class CommonService {

  closeEvent: Subject<any> = new BehaviorSubject(null);
  constructor() {
  }
}
