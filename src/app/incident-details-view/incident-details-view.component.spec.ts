import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetailsViewComponent } from './incident-details-view.component';

describe('IncidentViewComponent', () => {
  let component: IncidentDetailsViewComponent;
  let fixture: ComponentFixture<IncidentDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetailsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncidentDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
