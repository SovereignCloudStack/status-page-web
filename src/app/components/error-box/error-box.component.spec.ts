import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorBoxComponent } from './error-box.component';

describe('ErrorBoxComponent', () => {
  let component: ErrorBoxComponent;
  let fixture: ComponentFixture<ErrorBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ErrorBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
