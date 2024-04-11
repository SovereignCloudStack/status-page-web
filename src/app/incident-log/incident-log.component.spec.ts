import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentLogComponent } from './incident-log.component';

describe('IncidentLogComponent', () => {
  let component: IncidentLogComponent;
  let fixture: ComponentFixture<IncidentLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentLogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncidentLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
