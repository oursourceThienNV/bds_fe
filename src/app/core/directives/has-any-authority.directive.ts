import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
// import {AccountService} from "../services/authfake.service";

@Directive({
  selector: '[hasAnyAuthority]'
})
export class HasAnyAuthorityDirective {
  private authorities: string[];

  constructor(
    // private accountService: AccountService,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  @Input()
  set hasAnyAuthority(value: string | string[]) {
    if (value) {
      this.authorities = typeof value === 'string' ? [value] : value;
    } else {
      this.authorities = [];
    }
    this.updateView();
    // this.accountService.roles.subscribe(role => {
    //   this.updateView()
    // });
  }

  private updateView(): void {
    // const hasAnyAuthority = this.accountService.hasAnyAuthority(this.authorities);
    this.viewContainerRef.clear();

    // if (hasAnyAuthority) {
    //   this.viewContainerRef.createEmbeddedView(this.templateRef);
    // }
  }
}
