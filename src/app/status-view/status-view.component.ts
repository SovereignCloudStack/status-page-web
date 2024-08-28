import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
import { DataService } from '../data.service';
import { IncidentLogComponent } from '../incident-log/incident-log.component';
import { ComponentListComponent } from '../component-list/component-list.component';
import { UserSettingsService } from '../user-settings.service';
import { ComponentTableComponent } from '../component-table/component-table.component';
import { MaintenanceOverviewComponent } from '../maintenance-overview/maintenance-overview.component';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, IncidentLogComponent, ComponentListComponent, ComponentTableComponent, MaintenanceOverviewComponent],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  constructor(
    public userSettings: UserSettingsService,
    public data: DataService
  ) {}
}
