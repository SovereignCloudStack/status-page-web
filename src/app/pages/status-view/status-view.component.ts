import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { IncidentLogComponent } from '../../components/incident-log/incident-log.component';
import { ComponentListComponent } from '../../components/component-list/component-list.component';
import { UserSettingsService } from '../../services/user-settings.service';
import { ComponentTableComponent } from '../../components/component-table/component-table.component';
import { MaintenanceOverviewComponent } from '../../components/maintenance-overview/maintenance-overview.component';
import { MainPageButtonsComponent } from '../../components/main-page-buttons/main-page-buttons.component';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, IncidentLogComponent, ComponentListComponent, ComponentTableComponent, MaintenanceOverviewComponent, MainPageButtonsComponent],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  constructor(
    public userSettings: UserSettingsService,
    public data: DataService
  ) {}
}
