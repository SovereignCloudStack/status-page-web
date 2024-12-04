import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementViewComponent } from './management-view.component';

describe('ManagementViewComponent', () => {
  let component: ManagementViewComponent;
  let fixture: ComponentFixture<ManagementViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagementViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
