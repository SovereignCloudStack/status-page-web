import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { AppConfigService } from '../app-config.service';
import { IncidentLogListComponent } from '../incident-log-list/incident-log-list.component';

@Component({
  selector: 'app-incident-log',
  standalone: true,
  imports: [CommonModule, IncidentLogListComponent],
  templateUrl: './incident-log.component.html',
  styleUrl: './incident-log.component.css'
})
export class IncidentLogComponent {

  constructor(
    private config: AppConfigService,
    public data: DataService
  ) {}
}
