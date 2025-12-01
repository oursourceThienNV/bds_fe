import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {IActionMapping, ITreeOptions} from "@circlon/angular-tree-component";
import {AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";

@Component({
  selector: 'tree-picker-radio',
  templateUrl: './tree-picker-radio.component.html',
  styleUrls: ['./tree-picker-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreePickerRadioComponent),
      multi: true
    }
  ],
})
export class TreePickerRadioComponent implements ControlValueAccessor,OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (this.nodeSelect && changes.nodeSelect){
      this.treeInput.nativeElement.value = this.nodeSelect;
    }
  }

  @Input() formControlName: string;
  @Input() nodes;
  @Input() dept:any
  @Output() checkEmit=new EventEmitter();
  control: AbstractControl;
  treeValue: any = [];
  disabled = false;
  @Input() nodeSelect;

  propagateChange = (_: any) => {
  };

  treeSelected: Set<any> = new Set<any>();

  @ViewChild('treeInput', {static: false}) treeInput;
  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node) => this.check(node),
      checkboxClick: (tree, node) => this.check(node)
    }
  };
  options: ITreeOptions = {
    actionMapping: this.actionMapping
  };

  constructor(private controlContainer: ControlContainer,
              protected cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (this.controlContainer && this.formControlName) {
      this.control = this.controlContainer.control.get(this.formControlName);
    }
  }
  clearNode(node) {
    node.checked = false;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.clearNode(node.children[i]);
      }
    }
  }
  clearTreeValue() {
    for (let i = 0; i < this.nodes.length; i++) {
      this.clearNode(this.nodes[i]);
    }
    this.treeValue = [];
    this.treeSelected.clear();
    this.propagateChange(this.treeValue);
    this.treeInput.nativeElement.value = '';
  }
  public check(node) {
    console.log(node);
      this.treeInput.nativeElement.value = node.name;

      this.checkEmit.emit(node);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.treeValue = obj;
    if (!this.cd['destroyed']) {
      this.cd.detectChanges();
    }
  }

}
