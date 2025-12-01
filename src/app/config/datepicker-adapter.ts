import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable()
export class NgbDateMomentAdapter extends NgbDateAdapter<moment.Moment> {

  fromModel(date: moment.Moment): NgbDateStruct {
    if (!date) {
      return null;
    }
    return { year: date.year(), month: date.month(), day: date.date() };
  }

  toModel(date: NgbDateStruct): moment.Moment {
    if (!date) {
      return null;
    }
    return moment(date.year + '-' + date.month + '-' + date.day, 'YYYY-MM-DD');
  }
}
