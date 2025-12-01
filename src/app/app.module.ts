import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from "@auth0/angular-jwt";

import { NgbAccordionModule, NgbDateParserFormatter, NgbModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { ExtrapagesModule } from './extrapages/extrapages.module';

import { LayoutsModule } from './layouts/layouts.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ErrorInterceptor } from './core/helpers/error.interceptor';
import { JwtInterceptor } from './core/helpers/jwt.interceptor';
import { CategoryModule } from "./pages/category/category.module";
import { AuthExpiredInterceptor } from "./core/helpers/auth-expired.interceptor";
import { NgbDateCustomParserFormatter } from "./config/NgbDateCustomParserFormatter";
// import { ConfigIP, ConfigIpService } from "./config-ip.service";
import { SharedModule, SharedModule as SharedModuleV2 } from "./shared/shared.module";
import { CommonModule, registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { ApiUrl } from "./shared/constant/ApiUrl.constant";
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TokenInterceptor } from './tokenInterceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {NgSelectModule} from "@ng-select/ng-select";
import {NgxQRCodeModule} from "ngx-qrcode2";
import {StompRService} from "@stomp/ng2-stompjs";
import {ToastrModule} from "ngx-toastr";
import {ChatWidgetComponent} from "./shared/chat/chat-widget.component";

import { LOCALE_ID } from '@angular/core';
import localeVi from '@angular/common/locales/vi';


// if (environment.defaultauth === 'firebase') {
//   initFirebaseBackend(environment.firebaseConfig);
// } else {
//   // tslint:disable-next-line: no-unused-expression
//   FakeBackendInterceptor;
// }
registerLocaleData(vi);

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

// const appInitializerFn = (appConfig: ConfigIpService) => {
//   return () => {
//     return appConfig.loadConfig();
//   };
// };

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
  ],
  imports: [
    ReactiveFormsModule,
    NzDatePickerModule,
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      defaultLanguage: 'vi',
      useDefaultLang: true
    }),
    NgxQRCodeModule,
    FormsModule,
    LayoutsModule,
    AppRoutingModule,
    ExtrapagesModule,
    CategoryModule,
    CarouselModule,
    NgbAccordionModule,
    NgbNavModule,
    NgbTooltipModule,
    SharedModule,
    ScrollToModule.forRoot(),
    NgbModule,
    SharedModuleV2,
    NgSelectModule,
    BrowserAnimationsModule,
  ],
  providers: [
    StompRService,
    ApiUrl,
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: AuthExpiredInterceptor, multi: true},
    // {provide: NgbDateAdapter, useClass: NgbDateMomentAdapter},
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
    {provide: JWT_OPTIONS, useValue: JWT_OPTIONS}, JwtHelperService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'vi-VN' }

    // { provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true },
    // LoaderService,
    // { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true },
    // {
    //   provide: ConfigIP,
    //   useExisting: ConfigIpService,
    //   deps: [HttpClientModule]
    // },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: appInitializerFn,
    //   multi: true,
    //   deps: [ConfigIpService, ApiUrl]
    // },
  ],
})
export class AppModule {
}
