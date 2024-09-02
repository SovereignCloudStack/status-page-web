import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { UserSettingsService } from './user-settings.service';
import { DataService } from './data.service';
import { SpinnerComponent } from './spinner/spinner.component';
import { ApiModule } from '../external/lib/status-page-api/angular-client';
import { AppConfigService } from './app-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent, SpinnerComponent, ApiModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'scs-statuspage';

  showAccessibilityOptions: boolean = true;
  showViewModeOptions: boolean = true;

  loaded: boolean = false;
  _showAboutSection: boolean = true;

  constructor(
    private router: Router,
    private api: ApiModule,
    private data: DataService,
    public appConfig: AppConfigService,
    public userSettings: UserSettingsService,
  ) {
    // Only enable about section as well as accessibility and view options when we 
    // show the default view, aka the actual status data. We don't really need them 
    // for the incident, management, imprint or cookie policy pages.
    // TODO This solution is a bit hacky. Check if we can instead move the about and
    // settings sections into the outlet and just show it on the correct routes.
    router.events.forEach((e) => {
      if (e instanceof NavigationEnd) {
        if (e.url != "/" && !e.url.startsWith("/#")) {
          this.userSettings.showUserSettings = false;
          this._showAboutSection = false;
        } else {
          this.userSettings.showUserSettings = true;
          this._showAboutSection = true;
        }
      }
    });
  }

  get showAboutSection(): boolean {
    return this._showAboutSection && this.appConfig.aboutText.length > 0;
  }

  ngOnInit(): void {
    this.data.loadingFinished.subscribe(loadStatus => {
      this.loaded = loadStatus;
    });
  }
}
