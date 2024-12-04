import { Component as AComponent, Input } from '@angular/core';
import { Component } from '../../../external/lib/status-page-api/angular-client'; 
import { CommonModule, KeyValue } from '@angular/common';
import { CallbackPipe } from '../../pipes/callback.pipe';
import { DailyStatus } from '../../model/daily-status';
import { UserSettingsService } from '../../services/user-settings.service';
import { RouterModule } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { AppConfigService } from '../../services/app-config.service';
import { ComponentId } from '../../model/base';

@AComponent({
  selector: 'app-component-table',
  standalone: true,
  imports: [CommonModule, RouterModule, CallbackPipe],
  templateUrl: './component-table.component.html',
  styleUrl: './component-table.component.css'
})
export class ComponentTableComponent {

  @Input() data: Map<ComponentId, Component> = new Map();
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
