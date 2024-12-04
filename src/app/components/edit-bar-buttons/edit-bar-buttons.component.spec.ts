import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBarButtonsComponent } from './edit-bar-buttons.component';

describe('EditBarButtonsComponent', () => {
  let component: EditBarButtonsComponent;
  let fixture: ComponentFixture<EditBarButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBarButtonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBarButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
