import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { UserSettingsService } from './user-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'scs-statuspage';

  showAccessibilityOptions: boolean = true;
  showViewModeOptions: boolean = true;

  constructor(
    private router: Router,
    public userSettings: UserSettingsService,
  ) {
    // Only enable accesibility and view options when we show the default view, aka
    // the actual status data. We don't really need thme for the imprint or cookie
    // policy pages.
    router.events.forEach((e) => {
      if (e instanceof NavigationEnd) {
        console.log(e);
        if (e.url != "/" && !e.url.startsWith("/#")) {
          this.userSettings.setShowUserSettings(false);
        } else {
          this.userSettings.setShowUserSettings(true);
        }
      }
    })
  }
}
