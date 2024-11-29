import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { UserSettingsService } from './services/user-settings.service';
import { DataService } from './services/data.service';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AppConfigService } from './services/app-config.service';
import { IconProviderService } from './services/icon-provider.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { firstValueFrom } from 'rxjs';
import { IncidentService } from '../external/lib/status-page-api/angular-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent, SpinnerComponent, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'scs-statuspage';

  showAccessibilityOptions: boolean = true;
  showViewModeOptions: boolean = true;

  loaded: boolean = false;
  _showAboutSection: boolean = true;
  _showNewIncidentButton: boolean = false;

  userAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private data: DataService,
    private security: OidcSecurityService,
    private incidentService: IncidentService,
    public appConfig: AppConfigService,
    public userSettings: UserSettingsService,
    public ip: IconProviderService,
  ) {
    // Only enable about section as well as accessibility and view options when we 
    // show the default view, aka the actual status data. We don't really need them 
    // for the incident, management, imprint or cookie policy pages.
    // TODO This solution is a bit hacky. Check if we can instead move the about and
    // settings sections into the outlet and just show it on the correct routes.
    router.events.forEach((e) => {
      if (e instanceof NavigationEnd) {
        console.log(e.url);
        if (e.url !== "/" && !e.url.startsWith("/#")) {
          this.userSettings.showUserSettings = false;
          this._showAboutSection = false;
          this._showNewIncidentButton = false;
        } else {
          this.userSettings.showUserSettings = true;
          this._showAboutSection = true;
          this._showNewIncidentButton = true;
        }
      }
    });
  }

  get showAboutSection(): boolean {
    return this._showAboutSection && this.appConfig.aboutText.length > 0;
  }

  get showButtonBar(): boolean {
    return this.userAuthenticated && this._showNewIncidentButton;
  }

  ngOnInit(): void {
    this.data.loadingFinished.subscribe(loadStatus => {
      this.loaded = loadStatus;
    });
    // Check if the user is authenticated
    this.security.checkAuth().subscribe(async response => {
      this.userAuthenticated = response.isAuthenticated;
      if (this.userAuthenticated) {
        const token = await firstValueFrom(this.security.getAccessToken());
        this.incidentService.configuration.withCredentials = true;
        this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
      }
    });
  }

  startNewIncident(): void {
    this.router.navigateByUrl("/incident/new");
  }
}
