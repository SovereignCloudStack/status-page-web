import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentResponseData, IncidentService } from '../../external/lib/status-page-api/angular-client';
import { firstValueFrom } from 'rxjs';
import dayjs from 'dayjs';
import { AppConfigService } from '../app-config.service';
import { DataService } from '../data.service';
import { DatePipe } from '../date.pipe';

@Component({
  selector: 'app-maintenance-overview',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './maintenance-overview.component.html',
  styleUrl: './maintenance-overview.component.css'
})
export class MaintenanceOverviewComponent implements OnInit {
  protected maintenanceEvents?: Array<IncidentResponseData>
  constructor(
    private incidentService: IncidentService,
    protected config: AppConfigService,
    protected dataService: DataService
  ) {};

  async ngOnInit(): Promise<void> {
    const currentDate = dayjs();
    const future = currentDate.add(this.config.maintenancePreviewDays, "d");

    const incidents = (await firstValueFrom(this.incidentService.getIncidents(
      this.config.formatQueryDate(currentDate),
      this.config.formatQueryDate(future)
    )))?.data;

    this.maintenanceEvents = incidents.filter((incident) => {
      incident.affects = incident.affects?.filter((affects) => {
        const maintenanceSeverity = this.config.severities.get('maintenance');
        const maintenanceSeverityValue = maintenanceSeverity ? maintenanceSeverity.end : 0;

        return affects.severity !== undefined && affects.severity <= maintenanceSeverityValue;
      });

      return incident.affects !== undefined && incident.affects.length > 0;
    });
  }
}
