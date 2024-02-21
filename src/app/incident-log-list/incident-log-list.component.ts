import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Dayjs } from 'dayjs';
import { AppConfigService } from '../app-config.service';
import { DataService } from '../data.service';
import { FIncident } from '../model/frontend/incident';
import { ReversePipe } from '../reverse.pipe';

@Component({
  selector: 'app-incident-log-list',
  standalone: true,
  imports: [CommonModule, ReversePipe],
  templateUrl: './incident-log-list.component.html',
  styleUrl: './incident-log-list.component.css'
})
export class IncidentLogListComponent {

  @Input() data: Map<string, FIncident[]> = new Map();

  constructor(
    private config: AppConfigService
  ) {}

  // TODO Place this somewhere where it is globally available
  df(dt: Dayjs): string {
    return dt.format(this.config.dateFormat);
  }
}
