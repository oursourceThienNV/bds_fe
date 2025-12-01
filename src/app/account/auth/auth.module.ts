import {NgModule} from '@angular/core';

import {LoginComponent} from "./login/login.component";
import {SignupComponent} from "./signup/signup.component";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbAlertModule} from "@ng-bootstrap/ng-bootstrap";
import {UIModule} from "../../shared/ui/ui.module";
import {AuthRoutingModule} from "./auth-routing";
import {CarouselModule} from "ngx-owl-carousel-o";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbAlertModule,
    UIModule,
    AuthRoutingModule,
    CarouselModule
  ]
})
export class AuthModule {
}
