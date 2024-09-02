import { bootstrapApplication } from '@angular/platform-browser';
import { buildAppConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advformat from 'dayjs/plugin/advancedFormat';

// Load dayjs plugins we need.
dayjs.extend(timezone);
dayjs.extend(advformat);
dayjs.extend(utc);

fetch("/assets/config.json")
  .then((response) => response.json())
  .then((json) => {
    bootstrapApplication(AppComponent, buildAppConfig(json))
    .catch((err) => console.error(err));
  });
