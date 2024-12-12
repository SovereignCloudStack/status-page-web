import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserSettingsService } from '../../services/user-settings.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  private readonly oidcSecurityService = inject(OidcSecurityService);
  protected readonly userData = this.oidcSecurityService.userData;
  protected readonly authenticated = this.oidcSecurityService.authenticated;

  constructor(
    public userSettings: UserSettingsService,
    public config: AppConfigService
  ) {}

  login(): void {
    this.oidcSecurityService.authorize();
  }

  handleKeyPress(e:KeyboardEvent) {
    if (e.key == "Enter") {
      this.login();
    }
  }
}
