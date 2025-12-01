import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];

  constructor() {
  }

  show(textOrTpl: string, config: any) {
    this.toasts = [];
    this.toasts.push({textOrTpl, ...config});
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t != toast);
  }

  showSuccess(message: string) {
    const object = {classname: 'bg-success text-light', delay: 5000, isSuccess: true};
    this.show(message, object);

  }

  showDanger(message: string) {
    const object = {classname: 'bg-danger text-light', delay: 5000, isSuccess: false}
    this.show(message, object);
  }
}
