import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dayjs } from 'dayjs';

const DT_QUERY_FORMAT = "YYYY-MM-DDTHH[%3A]mm[%3A]ss.SSSZ";

interface Severity {
  start: number;
  end: number;
  color: string;
  colorblind: string;
}

class Config {
  apiServerUrl: string = "";
  noOfDays: number = 90;
  dateFormat: string = "YYYY-MM-DD HH:mm:ss z";
  longDateFormat: string = "dddd, Do MMMM YYYY, HH:mm:ss z";
  severities: Map<string, Severity> = new Map();
  unknownColor: string = "lightsteelblue";
  useTestData: boolean = false;

  constructor() {
    // Add default values to severities map?
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config: Config = new Config();

  constructor(private http: HttpClient) {
    http.get<Config>("/assets/config.json").subscribe(c => {
      // The parsed JSON object has the severity entries as object properties.
      // Convert them into the map format we expect.
      c.severities = new Map(Object.entries(c.severities ?? []));
      // TODO Add default map or error on map missing
      this.config = c;
    });
  }

  get noOfDays(): number {
    return this.config.noOfDays;
  }

  get dateFormat(): string {
    return this.config.dateFormat;
  }

  get longDateFormat(): string {
    return this.config.longDateFormat;
  }

  get severities(): Map<string, Severity> {
    return this.config.severities;
  }

  get unknownColor(): string {
    return this.config.unknownColor;
  }

  get apiServerUrl(): string {
    return this.config.apiServerUrl;
  }

  get useTestData(): boolean {
    return this.config.useTestData;
  }

  incidentsUrl(start: Dayjs, end: Dayjs): string {
    if (this.useTestData) {
      return "assets/testdata/incidents.json";
    } else {
      return `${this.config.apiServerUrl}/incidents?start=${start.utc().format(DT_QUERY_FORMAT)}&end=${end.utc().format(DT_QUERY_FORMAT)}`;
    }
  }

  incidentUpdateUrl(id: string): string {
    if (this.useTestData) {
      return `assets/testdata/updates/updates-${id}.json`;
    } else {
      return `${this.config.apiServerUrl}/incidents/${id}/updates`;
    }
  }

  get componentsUrl(): string {
    if (this.useTestData) {
      return "assets/testdata/components.json";
    } else {
      return `${this.config.apiServerUrl}/components`;
    }
  }
}
