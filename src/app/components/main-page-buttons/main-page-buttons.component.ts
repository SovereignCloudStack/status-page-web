import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProviderService } from '../../services/icon-provider.service';

@Component({
  selector: 'app-main-page-buttons',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './main-page-buttons.component.html',
  styleUrl: './main-page-buttons.component.css'
})
export class MainPageButtonsComponent implements OnInit {

  userAuthenticated: boolean = false;

  constructor(
    private security: OidcSecurityService,
    private router: Router,
    public ip: IconProviderService
  ) {}

  ngOnInit(): void {
    this.security.checkAuth().subscribe(async response => {
      this.userAuthenticated = response.isAuthenticated;
      // if (this.userAuthenticated) {
      //   const token = await firstValueFrom(this.security.getAccessToken());
      //   this.incidentService.configuration.withCredentials = true;
      //   this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
      // }
    });
  }

  startNewIncident(): void {
    this.router.navigateByUrl("/incident/new");
  }
}
