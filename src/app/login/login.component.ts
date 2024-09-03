import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

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
    private security: OidcSecurityService
  ) {}

  waiting: boolean = true;
  success: boolean = false;

  async ngOnInit(): Promise<void> {
    const login = await firstValueFrom(this.security.checkAuth());
    this.waiting = false;
    this.success = login.isAuthenticated;
    if (this.success) {
      this.redirectTimeoutID = window.setTimeout(() => {
        this.router.navigate([""]);
      }, this.redirectTimeout);
    }
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.redirectTimeoutID);
  }
}
