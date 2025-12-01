import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  NgbDatepickerModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbToastModule,
  NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import {UIModule} from './ui/ui.module';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {WidgetModule} from './widget/widget.module';
import {TranslateModule} from '@ngx-translate/core';
import {InlineMesssageComponent} from './component/inline-messsage/inline-messsage.component';
import {ToastComponent} from './components/toast/toast.component';
import {DatePickerComponent} from './components/date-picker/date-picker.component';
import {PaginationComponent} from './components/pagination/pagination.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NotificationComponent} from "./components/notification/notification.component";
import {FileUploadComponent} from './components/file-upload/file-upload.component';
import {DndDirective} from './directives/dnd.directive';
import {FormatDateDirectiveDirective} from "./directives/format-no-space.directive";
import {TreePickerComponent} from './component/tree-picker/tree-picker.component';
import {TreeModule} from "@circlon/angular-tree-component";
import {DropdownDirective} from "./directives/dropdown.directive";
import {DropdownToggleDirective} from "./directives/dropdown-toggle.directive";
import {DropdownMenuDirective} from "./directives/dropdown-menu.directive";
import {TreePickerRadioComponent} from "./component/tree-picker-radio/tree-picker-radio.component";
import {AngularTreeGridModule} from "angular-tree-grid";
import {TreePickerTableComponent} from "./component/tree-picker-table/tree-picker-table.component";
import {
  TreePickerInputDescriptionComponent
} from "./component/tree-picker-table/tree-picker-input-description.component";
import {FullPageLoadingComponent} from "./full-page-loading/full-page-loading.component";
import {ChatWidgetComponent} from "./chat/chat-widget.component";

@NgModule({
  declarations: [
    InlineMesssageComponent,
    TreePickerComponent,
    ToastComponent,
    DatePickerComponent,
    PaginationComponent,
    NotificationComponent,
    FileUploadComponent,
    DndDirective,
    FormatDateDirectiveDirective,
    TreePickerComponent,
    DropdownDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    TreePickerRadioComponent,
    TreePickerTableComponent,
    TreePickerInputDescriptionComponent,
    FullPageLoadingComponent,
    ChatWidgetComponent
  ],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule,
    TranslateModule,
    NgbDatepickerModule,
    NgbPaginationModule,
    NgbTimepickerModule,
    NgbToastModule,
    NgbTooltipModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    AngularTreeGridModule
  ],
  exports: [
    InlineMesssageComponent,
    TreePickerComponent,
    ToastComponent,
    DatePickerComponent,
    PaginationComponent,
    FileUploadComponent,
    DndDirective,
    FormatDateDirectiveDirective,
    TreePickerRadioComponent,
    TreePickerTableComponent,
    FullPageLoadingComponent,
    ChatWidgetComponent,
  ]
})

export class SharedModule { }
