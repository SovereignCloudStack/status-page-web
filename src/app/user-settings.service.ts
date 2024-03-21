import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';

const COOKIE_USE_TABLE: string = "UseTableDisplay";
const COOKIE_HIDE_BORING: string = "HideBoringDays";
const COOKIE_COLORBLIND: string = "UseColorblindColors"



@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  private _showUserSettings$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _useTableDisplay$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _hideBoringDays$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _useColorblindColors$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private cookieService: CookieService) {
    this._useTableDisplay$.next(cookieService.get(COOKIE_USE_TABLE) === "true");
    this._hideBoringDays$.next(cookieService.get(COOKIE_HIDE_BORING) === "true");
    this._useColorblindColors$.next(cookieService.get(COOKIE_COLORBLIND) === "true");
  }

  get observeShowUserSettings(): Observable<boolean> {
    return this._showUserSettings$.asObservable();
  }

  get showUserSettings(): boolean {
    return this._showUserSettings$.value;
  }

  set showUserSettings(show: boolean) {
    this._showUserSettings$.next(show);
  }

  get observeUseTableDisplay(): Observable<boolean> {
    return this._useTableDisplay$.asObservable();
  }

  get useTableDisplay(): boolean {
    return this._useTableDisplay$.value;
  }

  set useTableDisplay(tableMode: boolean | undefined) {
    let mode = tableMode !== undefined ? tableMode : false;
    this.cookieService.set(COOKIE_USE_TABLE, this.bs(mode));
    this._useTableDisplay$.next(mode);
  }

  get observeHideBoringDays(): Observable<boolean> {
    return this._hideBoringDays$;
  }

  get hideBoringDays(): boolean {
    return this._hideBoringDays$.value;
  }

  set hideBoringDays(hidden: boolean) {
    this.cookieService.set(COOKIE_HIDE_BORING, this.bs(hidden));
    this._hideBoringDays$.next(hidden);
  }

  get observeUseColorblindColors(): Observable<boolean> {
    return this._useColorblindColors$.asObservable();
  }

  get useColorblindColors(): boolean {
    return this._useColorblindColors$.value;
  }

  set useColorblindColors(colorblind: boolean) {
    this.cookieService.set(COOKIE_COLORBLIND, this.bs(colorblind));
    this._useColorblindColors$.next(colorblind);
  }

  getCheckedState(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  private bs(v: boolean): string {
    return v ? "true" : "false";
  }
}
