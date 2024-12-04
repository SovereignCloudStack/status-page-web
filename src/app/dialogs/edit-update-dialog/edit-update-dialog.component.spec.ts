import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUpdateDialogComponent } from './edit-update-dialog.component';

describe('EditUpdateDialogComponent', () => {
  let component: EditUpdateDialogComponent;
  let fixture: ComponentFixture<EditUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
