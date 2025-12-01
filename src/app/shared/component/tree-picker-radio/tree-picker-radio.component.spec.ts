import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePickerRadioComponent } from './tree-picker-radio.component';

describe('TreePickerComponent', () => {
  let component: TreePickerRadioComponent;
  let fixture: ComponentFixture<TreePickerRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreePickerRadioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePickerRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
