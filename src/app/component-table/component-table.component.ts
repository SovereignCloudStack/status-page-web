import { Component, Input } from '@angular/core';
import { Component as ScsComponent } from 'scs-status-page-api';
import { CommonModule, KeyValue } from '@angular/common';
import { CallbackPipe } from '../callback.pipe';
import { DailyStatus } from '../model/frontend/daily-status';
import { UserSettingsService } from '../user-settings.service';
import { RouterModule } from '@angular/router';
import { UtilService } from '../util.service';
import { AppConfigService } from '../app-config.service';
import { ComponentId } from '../model/base';

@Component({
  selector: 'app-component-table',
  standalone: true,
  imports: [CommonModule, RouterModule, CallbackPipe],
  templateUrl: './component-table.component.html',
  styleUrl: './component-table.component.css'
})
export class ComponentTableComponent {

  @Input() data: Map<ComponentId, ScsComponent> = new Map();
  hideOperationalDays: boolean = false;

  constructor(
    public userSettings: UserSettingsService,
    public config: AppConfigService,
    public util: UtilService
  ) {
    userSettings.observeHideBoringDays.subscribe(hidden => {
      this.hideOperationalDays = hidden;
    });
  }

  filterDays = (kv: KeyValue<string, DailyStatus>): boolean => {
    if (this.hideOperationalDays && kv.value.activeIncidents.length === 0) {
      return false;
    }
    return true;
  }

  isHidden(day: DailyStatus): string {
    if (this.hideOperationalDays && day.activeIncidents.length === 0) {
      return "hidden";
    }
    return "";
  }
}
