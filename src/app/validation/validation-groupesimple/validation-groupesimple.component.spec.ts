import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationGroupesimpleComponent } from './validation-groupesimple.component';

describe('ValidationGroupesimpleComponent', () => {
  let component: ValidationGroupesimpleComponent;
  let fixture: ComponentFixture<ValidationGroupesimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationGroupesimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationGroupesimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
