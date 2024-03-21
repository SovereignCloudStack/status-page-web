import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentLogListComponent } from './incident-log-list.component';

describe('IncidentLogListComponent', () => {
  let component: IncidentLogListComponent;
  let fixture: ComponentFixture<IncidentLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentLogListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncidentLogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
