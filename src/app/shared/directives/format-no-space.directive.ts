import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
@Directive({
  selector: '[formatSpace]'
})
export class FormatDateDirectiveDirective {
  readonly numberRegex = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ$&+,:;=?@#|'<>.^*()%!\s]/;

  constructor(private el: ElementRef) {
  }

  @HostListener('input', ['$event'])
  @HostListener('focus', ['$event'])
  @HostListener('keypress', ['$event'])
  @HostListener('cut', ['$event'])
  @HostListener('paste', ['$event'])
  @HostListener('blur', ['$event'])
  onChange(event) {
    this.checkValue(event.target.value);
  }

  /**
   * Match value by number regex
   * @param value string value
   * @author GiangDV3
   */
  private checkValue(value: string) {
    if (String(value).match(new RegExp(this.numberRegex))) {
      var a = String(value).match(new RegExp(this.numberRegex));
      this.el.nativeElement.value = value.slice(0, a.index);
    }
  }
}
