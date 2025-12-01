import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  NgbNavModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbTooltipModule,
  NgbCollapseModule,
  NgbAccordionModule, NgbPaginationModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';
import {NgApexchartsModule} from 'ng-apexcharts';
import {FullCalendarModule} from '@fullcalendar/angular';
import {SimplebarAngularModule} from 'simplebar-angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import bootstrapPlugin from "@fullcalendar/bootstrap";
import {LightboxModule} from 'ngx-lightbox';

import {WidgetModule} from '../shared/widget/widget.module';
import {UIModule} from '../shared/ui/ui.module';

import {PagesRoutingModule} from './pages-routing.module';

import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {NgSelectModule} from "@ng-select/ng-select";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../shared/shared.module";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import { NgxQRCodeModule } from 'ngx-qrcode2';
import {NgxDropzoneModule} from "ngx-dropzone";

import { ShareAltOutline, CheckOutline, DeleteOutline } from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { NzIconModule } from 'ng-zorro-antd/icon';

const icons: IconDefinition[] = [ShareAltOutline, CheckOutline, DeleteOutline];

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  bootstrapPlugin
]);

@NgModule({
  declarations: [],

  imports: [
    NzIconModule.forRoot(icons),
    NgxDropzoneModule,
    CommonModule,
    NgxQRCodeModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDropdownModule,
    NgbModalModule,
    PagesRoutingModule,
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
    NgbPaginationModule,
    NgbTypeaheadModule,
    TranslateModule,
    SharedModule,
    TooltipModule,
  ],
})
export class PagesModule {
}
