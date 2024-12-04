import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditImpactDialogComponent } from './edit-impact-dialog.component';

describe('EditImpactDialogComponent', () => {
  let component: EditImpactDialogComponent;
  let fixture: ComponentFixture<EditImpactDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditImpactDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditImpactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
