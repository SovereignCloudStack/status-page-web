import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

const COOKIE_USE_TABLE: string = "UseTableDisplay";
const COOKIE_HIDE_BORING: string = "HideBoringDays";
const COOKIE_COLORBLIND: string = "UseColorblindColors"



@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  private _showUserSettings: boolean = true;
  private _useTableDisplay: boolean = false;
  private _hideBoringDays: boolean = false;
  private _useColorblindColors: boolean = false;

  constructor(private cookieService: CookieService) {
    this._useTableDisplay = cookieService.get(COOKIE_USE_TABLE) === "true";
    this._hideBoringDays = cookieService.get(COOKIE_HIDE_BORING) === "true";
    this._useColorblindColors = cookieService.get(COOKIE_COLORBLIND) === "true";
  }

  showUserSettings(): boolean {
    return this._showUserSettings;
  }

  setShowUserSettings(show: boolean) {
    this._showUserSettings = show;
  }

  useTableDisplay(): boolean {
    return this._useTableDisplay;
  }

  setUseTableDisplay(tableMode: boolean | undefined) {
    this._useTableDisplay = tableMode !== undefined ? tableMode : false;
    this.cookieService.set(COOKIE_USE_TABLE, this.bs(this._useTableDisplay));
  }

  hideBoringDays(): boolean {
    return this._hideBoringDays;
  }

  setHideBoringDays(hidden: boolean) {
    this._hideBoringDays = hidden;
    this.cookieService.set(COOKIE_HIDE_BORING, this.bs(this._hideBoringDays));
  }

  useColorblindColors(): boolean {
    return this._useColorblindColors;
  }

  setUseColorblindColors(colorblind: boolean) {
    this._useColorblindColors = colorblind;
    this.cookieService.set(COOKIE_COLORBLIND, this.bs(this._useColorblindColors));
  }

  getCheckedState(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  private bs(v: boolean): string {
    return v ? "true" : "false";
  }
}
