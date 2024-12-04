import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { IncidentService } from '../../../external/lib/status-page-api/angular-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  public redirectTimeout: number = 3000;
  private redirectTimeoutID?: number

  constructor(
    private router: Router,
    private security: OidcSecurityService,
    private incidentService: IncidentService
  ) {}

  waiting: boolean = true;
  success: boolean = false;

  async ngOnInit(): Promise<void> {
    const login = await firstValueFrom(this.security.checkAuth());
    this.waiting = false;
    this.success = login.isAuthenticated;
    if (this.success) {
      const token = await firstValueFrom(this.security.getAccessToken());
        this.incidentService.configuration.withCredentials = true;
        this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
      this.redirectTimeoutID = window.setTimeout(() => {
        this.router.navigate([""]);
      }, this.redirectTimeout);
    }
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.redirectTimeoutID);
  }
}
