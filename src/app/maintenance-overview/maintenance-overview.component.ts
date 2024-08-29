import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentResponseData, IncidentService } from '../../external/lib/status-page-api/angular-client';
import { firstValueFrom } from 'rxjs';
import dayjs from 'dayjs';
import { AppConfigService } from '../app-config.service';
import { DataService } from '../data.service';
import { DatePipe } from '../date.pipe';
import { formatQueryDate } from '../model/base';

@Component({
  selector: 'app-maintenance-overview',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './maintenance-overview.component.html',
  styleUrl: './maintenance-overview.component.css'
})
export class MaintenanceOverviewComponent {

  constructor(
    private incidentService: IncidentService,
    protected config: AppConfigService,
    protected data: DataService
  ) {}
}
