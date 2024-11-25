import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { DataService } from '../../services/data.service';
import { IncidentLogComponent } from '../../components/incident-log/incident-log.component';
import { ComponentListComponent } from '../../components/component-list/component-list.component';
import { UserSettingsService } from '../../services/user-settings.service';
import { ComponentTableComponent } from '../../components/component-table/component-table.component';
import { MaintenanceOverviewComponent } from '../../components/maintenance-overview/maintenance-overview.component';

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
