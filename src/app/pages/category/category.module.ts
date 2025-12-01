  import {NgModule} from '@angular/core';
  import {CommonModule, DatePipe} from '@angular/common';

  import {CategoryRoutingModule} from './category-routing.module';
  import {FormsModule, ReactiveFormsModule} from "@angular/forms";
  import {
    NgbAccordionModule,
    NgbCollapseModule, NgbDatepickerModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbTooltipModule,
    NgbTypeaheadModule,
  } from "@ng-bootstrap/ng-bootstrap";
  import {NgApexchartsModule} from "ng-apexcharts";
  import {HttpClientModule} from "@angular/common/http";
  import {UIModule} from "../../shared/ui/ui.module";
  import {WidgetModule} from "../../shared/widget/widget.module";
  import {FullCalendarModule} from "@fullcalendar/angular";
  import {SimplebarAngularModule} from "simplebar-angular";
  import {LightboxModule} from "ngx-lightbox";
  import {NgSelectModule} from "@ng-select/ng-select";
  import {TranslateModule} from "@ngx-translate/core";
  import {SharedModule} from "../../shared/shared.module";
  import {TooltipModule} from "ngx-bootstrap/tooltip";
  import {CKEditorModule} from "@ckeditor/ckeditor5-angular";

  import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
  import { UsersComponent } from './users/users.component';
  import { ResetPasswordComponent } from './users/reset-password/reset-password.component';
  import { UsersDialogComponent } from './users/users-dialog/users-dialog.component';
  import { MediaComponent } from './image/media.component';
  import { MediaDialogComponent } from './image/media-dialog.component';
  import { DashboardComponent } from './dashboard/dashboard.component';
  import { CompanyComponent } from './company/company.component';
  import { GroupTeamComponent } from './group-team/group-team.component';
  import { GroupTeamDialogComponent } from './group-team/group-team-dialog.component';
  import { NgxQRCodeModule } from 'ngx-qrcode2';
  import { CompanyDialogComponent } from './company/company-dialog.component';
  import { TreeGroupTeamComponent } from './group-team/tree-group-team.component';
  import { NgxGraphModule } from '@swimlane/ngx-graph';
  import { CustomerComponent } from './customer/customer.component';
  import {CustomerDialogComponent} from "./customer/customer-dialog.component";
  import {CustomerAddComponent} from "./customer/customer-add.component";
  import {CommonCodeComponent} from "./common-code/common-code.component";
  import {CommonCodeDialogComponent} from "./common-code/common-code-dialog.component";
  import {NgxDropzoneModule} from "ngx-dropzone";
  import {NgxMaskModule} from "ngx-mask";
  import {WorkspaceComponent} from "./workspace/workspace.component";
  import {WorkspaceFormComponent} from "./workspace/workspace-form.components";
  import {TaskStatusComponent} from "./task-status/task-status.component";
  import {TaskStatusDialogComponent} from "./task-status/task-status-dialog.component";
  import {TaskComponent} from "./task/task.component";
  import {TaskCreateDialogComponent} from "./task/task-create-dialog.component";
  import {TimepickerModule} from "ngx-bootstrap/timepicker";
  import {IssueDetailComponent} from "./task/issue-detail.component";
  import {ChatWidgetComponent} from "../../shared/chat/chat-widget.component";
  import {LicenseComponent} from "./license/license.component";
  import {LicenseDialogComponent} from "./license/license-dialog.component";
  import {ApplyKeyDialogComponent} from "./company/apply-key-dialog.component";
  import {MapCustomerComponent} from "./map-customer/map-customer.component";
  import {DragDropModule} from "@angular/cdk/drag-drop";
  @NgModule({
    declarations: [
      TreeGroupTeamComponent,
      UsersComponent,
      ResetPasswordComponent,
      UsersDialogComponent,
      MediaComponent,
      MediaDialogComponent,
      DashboardComponent,
      CompanyComponent,
      CompanyDialogComponent,
      GroupTeamComponent,
      GroupTeamDialogComponent,
      CommonCodeComponent,
      CommonCodeDialogComponent,
      CustomerComponent,
      CustomerDialogComponent,
      CustomerAddComponent,
      WorkspaceComponent,
      WorkspaceFormComponent,
      TaskStatusComponent,
      TaskStatusDialogComponent,
      TaskComponent,
      TaskCreateDialogComponent,
      IssueDetailComponent,
      LicenseComponent,
      LicenseDialogComponent,
      ApplyKeyDialogComponent,
      MapCustomerComponent
    ],
      imports: [
          NgxMaskModule.forRoot(),
          CommonModule,
          NgxGraphModule,
          CategoryRoutingModule,
          ReactiveFormsModule,
          FormsModule,
          NgbDropdownModule,
          NgbModalModule,
          NgApexchartsModule,
          ReactiveFormsModule,
          HttpClientModule,
          UIModule,
          WidgetModule,
          FullCalendarModule,
          NgbNavModule,
          NgbTooltipModule,
          NgbCollapseModule,
          SimplebarAngularModule,
          LightboxModule,
          NgbAccordionModule,
          NgSelectModule,
          NgbDatepickerModule,
          BsDatepickerModule,
          NgbPaginationModule,
          NgbTypeaheadModule,
          TranslateModule,
          NgbTooltipModule,
          TooltipModule,
          CKEditorModule,
          SharedModule,
          NgxQRCodeModule,
          NgxDropzoneModule,
          TimepickerModule,
          DragDropModule,
      ],
    providers: [
      DatePipe

  ]
  })
  export class CategoryModule {
  }
