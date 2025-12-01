import {AbstractControl, ValidatorFn} from "@angular/forms";

export class CustomValidator {

  static naturalNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const reg = new RegExp(/^[0-9]*$/)
      if (control.value !== null && control.value !== '' && control.value !== undefined && (isNaN(control.value) || !reg.test(control.value))) {
        return { 'invalidNaturalNumber': true };
      }
      return null;
    };
  }
}
