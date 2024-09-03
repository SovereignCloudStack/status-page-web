import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import dayjs from 'dayjs';
import { DailyStatus } from './model/daily-status';
import { UserSettingsService } from './user-settings.service';
import { Incident, IncidentUpdate } from '../external/lib/status-page-api/angular-client';
import { DataService } from './data.service';
import { ComponentId, IncidentId, Severity, ShortDayString } from './model/base';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private config: AppConfigService,
    private userSettings: UserSettingsService,
    private dataService: DataService
  ) { }

  formatDate(dt: string | null | undefined): string | null {
    if (!dt) {
      return null;
    }
    return dayjs(dt).format(this.config.dateFormat);
  }

  formatLongDate(dt: string | null | undefined): string | null {
    if (!dt) {
      return null;
    }
    return dayjs(dt).format(this.config.longDateFormat);
  }

  severityName(severity: Severity): string {
    for (const s of this.config.severities.entries()) {
      if (severity >= s[1].start && severity <= s[1].end) {
        return s[0];
      }
    }
    return "unknown";
  }

  severityColor(severity: Severity): string {
    for (const s of this.config.severities.values()) {
      if (severity >= s.start && severity <= s.end) {
        if (this.userSettings.useColorblindColors) {
          return s.colorblind;
        }
        return s.color;
      }
    }
    return this.config.unknownColor;
  }

  currentDaySeverity(componentId: ComponentId): Severity {
    return this.severityForDay(componentId, this.dataService.currentDay);
  }

  severityForDay(componentId: ComponentId, date: ShortDayString): Severity {
    const currentDayStatus = this.dayState(componentId, date);
    if (!currentDayStatus) {
      console.error(`Missing DailyStatus object for day ${date}`);
      return -1;
    }
    return currentDayStatus.overallSeverity;
  }

  currentStateStyle(componentId: ComponentId): string {
    const currentDayStatus = this.dayState(componentId, this.dataService.currentDay);
    if (!currentDayStatus) {
      console.error(`Missing DailyStatus object for day ${this.dataService.currentDay}`);
      return `background-color: ${this.config.unknownColor}`;
    }
    return this.dayStateStyle(currentDayStatus);
  }

  dayStateStyle(day: DailyStatus): string {
    const severityColor = this.severityColor(day.overallSeverity);
    return `background-color: ${severityColor}`;
  }

  dayState(componentId: ComponentId, date: ShortDayString): DailyStatus | undefined {
    return this.dataService.componentStatusByDay.get(componentId)?.get(date);
  }

  dailyStatesForComponent(componentId: ComponentId): Map<ShortDayString, DailyStatus> {
    const resultMap = this.dataService.componentStatusByDay.get(componentId);
    if (!resultMap) {
      console.error(`Missing map of daily status objects for component with the ID ${componentId}`);
      return new Map();
    }
    return resultMap;
  }

  componentAvailability(componentId: ComponentId): number {
    const availability = this.dataService.componentAvailability.get(componentId);
    if (!availability) {
      console.error(`Missing availability value for component with ID ${componentId}`);
      return 0;
    }
    return availability;
  }

  isCompleted(incident: Incident): boolean {
    return incident.beganAt !== undefined
      && incident.beganAt !== null
      && incident.endedAt !== undefined
      && incident.endedAt !== null;
  }

  isOngoing(incident: Incident): boolean {
    return !this.isCompleted(incident);
  }

  hasUpdates(incidentId: IncidentId): boolean {
    return this.updatesFor(incidentId).length > 0;
  }

  updatesFor(incidentId: IncidentId): IncidentUpdate[] {
    return this.dataService.incidentUpdates.get(incidentId) ?? [];
  }

  phaseName(phase?: number): string {
    if (phase !== undefined) {
      if (phase >= 0 && phase < this.dataService.phaseGenerations.phases.length) {
        return this.dataService.phaseGenerations.phases[phase];
      }
      return "unknown phase";
    }
    return "unknown phase";
  }

  componentName(componentId?: ComponentId): string {
    if (componentId !== undefined) {
      const component = this.dataService.components.get(componentId);
      if (component) {
        return component.displayName ?? "component missing name";
      }
      return "component not found";
    }
    return "unknown component";
  }
}
