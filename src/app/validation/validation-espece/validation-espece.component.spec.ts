import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationEspeceComponent } from './validation-espece.component';

describe('ValidationEspeceComponent', () => {
  let component: ValidationEspeceComponent;
  let fixture: ComponentFixture<ValidationEspeceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationEspeceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationEspeceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
