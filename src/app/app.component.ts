import { Component , OnInit} from '@angular/core';
import {AccountService} from "./account/auth/account.service";
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {

  constructor(private accountService: AccountService, private translateService: TranslateService) {

  }

  ngOnInit() {
    this.translateService.setDefaultLang('vi');
    this.translateService.use('vi');
    this.accountService.identity().subscribe(res=>{
      console.log("=>>>",res.body.userInfo);
      localStorage.setItem("role",res.body.userInfo.role);
    })
    // document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
  }
}
