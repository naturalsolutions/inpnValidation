import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationGroupetaxoComponent } from './validation-groupetaxo.component';

describe('ValidationGroupetaxoComponent', () => {
  let component: ValidationGroupetaxoComponent;
  let fixture: ComponentFixture<ValidationGroupetaxoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationGroupetaxoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationGroupetaxoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
