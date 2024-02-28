import { Component, Input } from '@angular/core';
import { FComponent } from '../model/frontend/component';
import { CommonModule, KeyValue } from '@angular/common';
import { CallbackPipe } from '../callback.pipe';
import { DailyStatus } from '../model/frontend/daily-status';
import { UserSettingsService } from '../user-settings.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-component-table',
  standalone: true,
  imports: [CommonModule, RouterModule, CallbackPipe],
  templateUrl: './component-table.component.html',
  styleUrl: './component-table.component.css'
})
export class ComponentTableComponent {

  @Input() data: FComponent[] = [];
  hideOperationalDays: boolean = false;

  constructor(
    public userSettings: UserSettingsService
  ) {
    userSettings.observeHideBoringDays.subscribe(hidden => {
      console.log("Changing property");
      this.hideOperationalDays = hidden;
    });
  }

  filterDays = (kv: KeyValue<string, DailyStatus>): boolean => {
    console.log("Running!");
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
