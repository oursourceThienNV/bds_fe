import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePickerTableComponent } from './tree-picker-table.component';

describe('TreePickerComponent', () => {
  let component: TreePickerTableComponent;
  let fixture: ComponentFixture<TreePickerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreePickerTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePickerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
