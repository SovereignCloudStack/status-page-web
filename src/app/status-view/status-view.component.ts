import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { Dayjs } from 'dayjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { DataService } from '../data.service';
import { IncidentLogComponent } from '../incident-log/incident-log.component';
import { ComponentListComponent } from '../component-list/component-list.component';
import { UserSettingsService } from '../user-settings.service';
import { ComponentTableComponent } from '../component-table/component-table.component';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, IncidentLogComponent, ComponentListComponent, ComponentTableComponent],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private config: AppConfigService,
    public userSettings: UserSettingsService,
    public data: DataService
  ) {}

  ngOnInit(): void {
    this.data.loaded().subscribe(loadStatus => {
      this.loaded = loadStatus;
    });
  }
}
