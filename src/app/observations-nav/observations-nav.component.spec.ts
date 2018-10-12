import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsNavComponent } from './observations-nav.component';

describe('ObservationsNavComponent', () => {
  let component: ObservationsNavComponent;
  let fixture: ComponentFixture<ObservationsNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationsNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
