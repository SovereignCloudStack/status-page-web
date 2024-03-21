import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import advformat from 'dayjs/plugin/advancedFormat'
import { FComponent } from './model/frontend/component';
import { DailyStatus } from './model/frontend/daily-status';
import { SImpact } from './model/server/impact';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private config: AppConfigService
  ) {
    dayjs.extend(timezone);
    dayjs.extend(advformat);
  }

  formatDate(dt: Dayjs | null): string {
    if (!dt) {
      return "";
    }
    return dt.format(this.config.dateFormat);
  }

  formatLongDate(dt: Dayjs | null): string {
    if (!dt) {
      return "";
    }
    return dt.format(this.config.longDateFormat);
  }

  severityName(severity: number): string {
    for (let s of this.config.severities.entries()) {
      if (severity >= s[1].start && severity <= s[1].end) {
        return s[0];
      }
    }
    return "unknown";
  }

  severityColor(severity: number): string {
    for (let s of this.config.severities.values()) {
      if (severity >= s.start && severity <= s.end) {
        // TODO Deal with colorblind mode
        return s.color;
      }
    }
    return this.config.unknownColor;
  }

  currentStateStyle(component: FComponent): string {
    return this.dayStateStyle(component.dailyData.values().next().value);
  }

  dayStateStyle(day: DailyStatus): string {
    let severityColor = this.severityColor(day.overallSeverity);
    return `background-color: ${severityColor}`;
  }
}
