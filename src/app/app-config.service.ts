import { Inject, Injectable, InjectionToken } from '@angular/core';

interface Severity {
  start: number;
  end: number;
  color: string;
  colorblind: string;
}

class Config {
  apiServerUrl: string = "";
  redirectUrl: string = "";
  dexUrl: string = "";
  dexId: string = "";
  noOfDays: number = 90;
  dateFormat: string = "YYYY-MM-DD HH:mm:ss z";
  longDateFormat: string = "dddd, Do MMMM YYYY, HH:mm:ss z";
  severities: Map<string, Severity> = new Map();
  unknownColor: string = "lightsteelblue";
  aboutText: string = "";
  maintenancePreviewDays: number = 30;

  constructor() {
    this.severities.set("maintenance", {
    start: 0,
    end: 0,
    color: "#50c3a5",
    colorblind: "#e1be6a"
    });
    this.severities.set("operational", {
    start: 1,
    end: 33,
    color: "#50c3a5",
    colorblind: "#8ce05d"
    });
    this.severities.set("limited", {
    start: 34,
    end: 66,
    color: "#f5c451",
    colorblind: "#5d3a9b"
    });
    this.severities.set("broken", {
    start: 67,
    end: 100,
    color: "#ee6a5f",
    colorblind: "#d62c13"
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config: Config = new Config();

  constructor(@Inject(CONFIG_JSON) private json: any) {
    // The parsed JSON object has the severity entries as object properties.
    // Convert them into the map format we expect.
    json.severities = new Map(Object.entries(json.severities ?? []));
    this.config = Object.assign(this.config, json);
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

  get redirectUrl(): string {
    return this.config.redirectUrl;
  }

  get dexUrl(): string {
    return this.config.dexUrl;
  }

  get dexId(): string {
    return this.config.dexId;
  }

  get aboutText(): string {
    return this.config.aboutText;
  }

  get maintenancePreviewDays(): number {
    return this.config.maintenancePreviewDays;
  }

  formatQueryDate(date: Dayjs): string {
    return date.format(DT_QUERY_FORMAT);
  }
}

export const CONFIG_JSON: InjectionToken<any> = new InjectionToken("CONFIG_JSON");
