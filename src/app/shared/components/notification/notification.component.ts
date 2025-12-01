import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalDto} from "./ModalDto";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})


export class NotificationComponent implements OnInit {
  @Input() modalDTO: ModalDto | undefined;
  type: undefined | string = '';
  title: undefined | string = '';
  content: undefined | string = '';
  okeBtnString!: string;
  noBtnString!: string;

  constructor(public activeModal: NgbActiveModal,) {
  }

  ngOnInit(): void {
    this.type = this.modalDTO && this.modalDTO.type;
    this.title = this.modalDTO && this.modalDTO.title;
    this.content = this.modalDTO && this.modalDTO.content;
    if (this.modalDTO.acceptBtnLabel) {
      this.okeBtnString = this.modalDTO.acceptBtnLabel;
    }
    if (this.modalDTO.closeBtnLabel) {
      this.noBtnString = this.modalDTO.closeBtnLabel
    }
  }

  closeModal() {
    this.activeModal.close('close');
  }

  acceptCloseModal() {
    this.activeModal.close('accept');
  }

  getColor(type: string): string {
    switch (type) {
      case 'WARNING':
        return 'warningColor';
      case 'ERROR':
        return 'dangerColor'
      case 'SUCCESS':
        return 'successColor'
      case 'NOTIFY':
        return 'infoColor'
      default: {
        return 'warningColor';
      }
    }
  }

  get getTitle(): string {
    if (this.type) {
      switch (this.type) {
        case 'WARNING':
          return 'common.warning';
        case 'ERROR':
          return 'common.error'
        case 'SUCCESS':
          return 'common.success'
        case 'NOTIFY':
          return 'common.notify'
        default: {
          return 'common.notify';
        }
      }
    } else {
      return "common.notify"
    }

  }
}
