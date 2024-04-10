import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { UserSettingsService } from './user-settings.service';
import { DataService } from './data.service';
import { SpinnerComponent } from './spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'scs-statuspage';

  showAccessibilityOptions: boolean = true;
  showViewModeOptions: boolean = true;

  loaded: boolean = false;
  showAboutSection: boolean = true;

  constructor(
    private router: Router,
    private data: DataService,
    public userSettings: UserSettingsService,
  ) {
    // Only enable about section as well as accessibility and view options when we 
    // show the default view, aka the actual status data. We don't really need them 
    // for the incident, imprint or cookie policy pages.
    router.events.forEach((e) => {
      if (e instanceof NavigationEnd) {
        if (e.url != "/" && !e.url.startsWith("/#")) {
          this.userSettings.showUserSettings = false;
          this.showAboutSection = false;
        } else {
          this.userSettings.showUserSettings = true;
          this.showAboutSection = true;
        }
      }
    })
  }

  ngOnInit(): void {
    this.data.loaded().subscribe(loadStatus => {
      this.loaded = loadStatus;
    });
  }
}
