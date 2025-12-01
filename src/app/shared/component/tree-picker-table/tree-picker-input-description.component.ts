import { Component, OnInit, Input } from '@angular/core';
import {DefaultEditor} from 'angular-tree-grid';

@Component({
  selector: 'app-custom-editor',
  template: `<input type="text">`,
})
export class TreePickerInputDescriptionComponent extends DefaultEditor {
  @Input()
  cell_value: string;

  @Input()
  row_data: any;

  @Input()
  column: any;

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
