import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { Dayjs } from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private config: AppConfigService
  ) {}

  formatDate(dt: Dayjs | null): string {
    if (!dt) {
      return "";
    }
    return dt.format(this.config.dateFormat);
  }
}
