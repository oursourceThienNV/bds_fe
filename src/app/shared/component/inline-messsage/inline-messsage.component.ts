import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-inline-messsage',
  templateUrl: './inline-messsage.component.html',
  styleUrls: ['./inline-messsage.component.scss']
})
export class InlineMesssageComponent implements OnInit {
  @Input() formName: FormControl;
  @Input() message: any;
  @Input() customMessage: any;
  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

  getMessage(error: any) {
    if (error) {
      const key = Object.keys(error);
      if (key) {
        if (this.customMessage && this.customMessage[key[0]]) {
          return this.customMessage[key[0]];
        } else return this.translate.instant( 'validation.' + key[0], {field: this.translate.instant( this.message) , value: error[key[0]] ? error[key[0]].requiredLength : ''});
      }
    }
  }

}
