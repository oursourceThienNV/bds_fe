import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineMesssageComponent } from './inline-messsage.component';

describe('InlineMesssageComponent', () => {
  let component: InlineMesssageComponent;
  let fixture: ComponentFixture<InlineMesssageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineMesssageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineMesssageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
