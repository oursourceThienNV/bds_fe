import {AngularTreeGridComponent} from 'angular-tree-grid';
import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {isCheckDisabled} from "ng-zorro-antd/core/tree";
@Component({
  selector: 'app-basic-tree-grid',
  templateUrl: './tree-picker-table.component.html',
  styleUrls: ['./tree-picker-table.component.scss'],

})
export class TreePickerTableComponent implements OnInit,OnChanges {
  @ViewChild('angularGrid') angularGrid: AngularTreeGridComponent;
  @Input() data;
  @Input() deselected: any = [];
  @Input() editSelected: any = [];
  @Input() checkDetail;
  @Input() type: any;
  readonly YC_KT = 1;
  check: any;
  configs: any = {
    id_field: 'id',
    parent_id_field: 'parentId',
    parent_display_field: 'name',
    multi_select: true,
    actions: {
      edit: true
    },
    columns: [
      {
        name: 'name',
        header: 'Hạng mục thí nghiệm',
        width: '40%',
      },
      {
        name: 'testMethod',
        header: 'Phương pháp thí nghiệm',
        width: '20%',
        editable: true,
      },
      {
        name: 'testCondition',
        header: 'Điều kiện thí nghiệm',
        width: '20%',
        editable: true,
      },
      {
        name: 'description',
        header: 'Ghi chú',
        width: '20%',
        editable: true,
      }
    ]
  };
  configs2: any = {
    id_field: 'id',
    parent_id_field: 'parentId',
    parent_display_field: 'name',
    multi_select: true,
    actions: {
      edit: true
    },
    columns: [
      {
        name: 'name',
        header: 'Hạng mục thí nghiệm',
        width: '70%',
      },
      {
        name: 'description',
        header: 'Ghi chú',
        width: '30%',
        editable: true,
      }
    ]
  };

  // thêm mới phần tử vào list
  selectData(e) {
    this.deselected.push(e.data);
    this.loadData();
  }

  // xóa phần tử khỏi list
  rowdeselect(e) {
    this.deselected = this.deselected.filter(data => data.id != e.data.id);
    console.log(this.deselected)
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
      this.loadData();
  }

 async loadData() {
   if(this.checkDetail==='VIEW'){
    await console.log(document.getElementsByTagName('checkbox_column'));
    if (document.getElementsByClassName('checkbox_column').item(0).firstChild) {
    await  document.getElementsByClassName('checkbox_column').item(0).removeChild(document.getElementsByClassName('checkbox_column').item(0).firstChild)
    }}
    if (this.data != null) {
      if (this.editSelected && this.checkDetail != 'CREATED') {
      await  this.data.forEach(e => {
            this.editSelected.forEach(select => {
              if (e.id === select.catTestGroupId) {
                e.row_selected = true;
                e.description = select.description;
                e.testCondition = select.testCondition;
                e.testMethod = select.testMethod;
                this.deselected.push(e);
              }
              if (this.checkDetail === 'VIEW') {
                if (e){
                  this.angularGrid.disableRowSelection(e.id);
                }
                this.angularGrid.configs.actions.edit = false;
              }
            }
            )
          }
        )
      }
    }
  }
}
