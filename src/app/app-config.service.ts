import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface Config {
  noOfDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config: Config = {};

  constructor(private http: HttpClient) {
    http.get<Config>("/assets/config.json").subscribe(c => this.config = c);
  }

  get noOfDays(): number {
    return this.config?.noOfDays || 90;
  }
}
