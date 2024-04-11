import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advformat from 'dayjs/plugin/advancedFormat';

// Load dayjs plugins we need.
dayjs.extend(timezone);
dayjs.extend(advformat);
dayjs.extend(utc);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
