import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface Severity {
  start: number;
  end: number;
  color: string;
  colorblind: string;
}

class Config {
  noOfDays: number = 90;
  dateFormat: string = "YYYY-MM-DD HH:mm:ss z";
  longDateFormat: string = "dddd, Do MMMM YYYY, HH:mm:ss z";
  severities: Map<string, Severity> = new Map();
  unknownColor: string = "lightsteelblue";

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
}
