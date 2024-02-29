import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import advformat from 'dayjs/plugin/advancedFormat'

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
}
