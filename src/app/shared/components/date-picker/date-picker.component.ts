import {Component, OnInit, Input} from '@angular/core';
import {BsLocaleService} from 'ngx-bootstrap/datepicker';
import {TranslateService} from '@ngx-translate/core';
import {enGbLocale, viLocale,} from 'ngx-bootstrap/locale';
import {defineLocale} from 'ngx-bootstrap/chronos';
import {AbstractControl, FormControl} from "@angular/forms";
import * as moment from "moment";

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  @Input() minMode: string;
  @Input() idDate: string;
  @Input() dateInputFormat: string;
  @Input() control: AbstractControl | FormControl
  input: any;

  constructor(private localeService: BsLocaleService,
              private translateService: TranslateService) {

    defineLocale(this.translateService.currentLang, this.translateService.currentLang == 'vi' ? viLocale : enGbLocale);
    this.localeService.use(this.translateService.currentLang);
    this.translateService.onLangChange.subscribe(langChang => {
      if (langChang) {
        defineLocale(this.translateService.currentLang, this.translateService.currentLang == 'vi' ? viLocale : enGbLocale);
        this.localeService.use(langChang.lang);
      }
    })
  }

  ngOnInit(): void {
    this.control.valueChanges.subscribe(value => this.input = value)
    if (this.control && this.control.value) {
      this.input = this.control.value
    }
  }

  ngModelChange(event: any) {
    if (event.target.value) {
      if (event.target.value === 'Invalid date' || !moment(event.target.value).isValid()) {
        this.control.setValue(new Date(), {emitEvent: false});
      }
    }
    // const validDate = moment(event).isValid();
    // if(!validDate){
    //   this.input = null;
    //   this.control.setValue(this.input, {emitEvent: false});
    //   return;
    // }
    // this.input = event;
    // this.control.setValue(this.input, {emitEvent: false});
  }
}
