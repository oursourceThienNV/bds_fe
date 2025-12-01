import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePickerComponent } from './tree-picker.component';

describe('TreePickerComponent', () => {
  let component: TreePickerComponent;
  let fixture: ComponentFixture<TreePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
