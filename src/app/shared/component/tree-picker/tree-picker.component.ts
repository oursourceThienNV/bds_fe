import {
  ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import {IActionMapping, ITreeOptions} from "@circlon/angular-tree-component";
import {AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";

@Component({
  selector: 'tree-picker',
  templateUrl: './tree-picker.component.html',
  styleUrls: ['./tree-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreePickerComponent),
      multi: true
    }
  ],
})
export class TreePickerComponent implements ControlValueAccessor, OnChanges {

  @Input() formControlName: string;
  @Input() nodes;
  @Input() label = 'name';
  @Input() value = 'id';
  @Input() multiple = false;

  control: AbstractControl;
  treeValue: any;
  disabled = false;

  propagateChange = (_: any) => {
  };

  treeSelected: Set<any> = new Set<any>();

  @ViewChild('treeInput', {static: false}) treeInput;
  actionMapping: IActionMapping = {};
  options: ITreeOptions = {
    actionMapping: this.actionMapping
  };

  constructor(private controlContainer: ControlContainer,
              protected cd: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && this.treeInput) {
      console.log(changes);
      this.updateValue(this.nodes, this.treeValue);
    }
  }

  ngOnInit(): void {
    if (this.controlContainer && this.formControlName) {
      this.control = this.controlContainer.control.get(this.formControlName);
    }
  }

  clearTreeValue() {
    for (let i = 0; i < this.nodes.length; i++) {
      this.clearNode(this.nodes[i]);
    }
    if (this.multiple) {
      this.treeValue = [];
    } else {
      this.treeValue = null;
    }
    this.treeSelected.clear();
    this.propagateChange(this.treeValue);
    this.treeInput.nativeElement.value = '';
  }

  clearNode(node) {
    node.checked = false;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.clearNode(node.children[i]);
      }
    }
  }

  public click(node, checked) {
    this.clearTreeValue();
    node.data.checked = true;
    this.addTreeValue(node);
    if (this.multiple) {
      if (this.value) {
        this.treeValue = Array.from(this.treeSelected).map(res => res[this.value]);
      } else {
        this.treeValue = Array.from(this.treeSelected);
      }
      this.treeInput.nativeElement.value = Array.from(this.treeSelected).map(res => res.name).join(',');
    } else {
      if (this.value) {
        this.treeValue = Array.from(this.treeSelected).map(res => res[this.value])[0];
      } else {
        this.treeValue = Array.from(this.treeSelected)[0];
      }
      this.treeInput.nativeElement.value = Array.from(this.treeSelected).map(res => res.name)[0];
    }
    this.propagateChange(this.treeValue);
  }

  public check(node, checked) {
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
    if (!this.disabled) {
      this.treeInput.nativeElement.value = Array.from(this.treeSelected).map(res => res.name).join(',');
      if (this.value) {
        this.treeValue = Array.from(this.treeSelected).map(res => res[this.value]);
      } else {
        this.treeValue = Array.from(this.treeSelected);
      }
      this.propagateChange(this.treeValue);
    }

  }

  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    this.updateTreeValue(node);
    if (node.children) {
      node.children.forEach((child) => this.updateChildNodeCheckbox(child, checked));
    }
  }

  public updateTreeValue(node) {
    if (node.data.checked) {
      this.addTreeValue(node);
    } else {
      this.removeTreeValue(node);
    }
  }

  public removeValue() {
    this.treeSelected.clear();
  }

  public addTreeValue(node) {
    this.treeSelected.add(node.data);
  }

  public removeTreeValue(node) {
    this.treeSelected.delete(node.data);
  }

  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }

    let allChildrenChecked = true;
    let noChildChecked = true;

    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }

    if (allChildrenChecked) {
      this.addTreeValue(node)
      node.data.checked = true;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      this.removeTreeValue(node);
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      this.removeTreeValue(node);
      node.data.checked = true;
      node.data.indeterminate = true;
    }
    this.updateParentNodeCheckbox(node.parent);
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
    console.log('chon data:', obj);
    this.treeValue = obj;
    if (!this.cd['destroyed']) {
      this.cd.detectChanges();
    }
  }

  updateValue(nodes, value) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i][this.value] === value) {
        this.treeValue = value;
        nodes[i].checked = true;
        this.treeInput.nativeElement.value = nodes[i][this.label];
        return;
      } else if (nodes[i].children && nodes[i].children.length > 0) {
        this.updateValue(nodes[i].children, value);
      }
    }

  }

}
