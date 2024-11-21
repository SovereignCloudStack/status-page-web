import { Component as AComponent, Input } from '@angular/core';
import { Component } from '../../external/lib/status-page-api/angular-client'; 
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../services/app-config.service';
import { UtilService } from '../services/util.service';
import { DailyStatus } from '../model/daily-status';
import dayjs from 'dayjs';
import { ComponentId } from '../model/base';

@AComponent({
  selector: 'app-component-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-list.component.html',
  styleUrl: './component-list.component.css'
})
export class ComponentListComponent {

  @Input() data: Map<ComponentId, Component> = new Map();

  constructor(
    public config: AppConfigService,
    public util: UtilService
  ) {}

  dayId(day: DailyStatus): string {
    if (day.topLevelIncident) {
      const targetDate = dayjs(day.topLevelIncident[1].beganAt).format("YYYY-MM-DD");
      return `#day-${targetDate}`;
    }
    return `#day-${day.day}`;
  }
}
