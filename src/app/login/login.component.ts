import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
export class LoginComponent {

  constructor(
    private router: Router,
    private security: OidcSecurityService
  ) {}

  waiting: boolean = true;
  success: boolean = false;

  async ngOnInit(): Promise<void> {
    let login = await firstValueFrom(this.security.checkAuth());
    this.waiting = false;
    this.success = login.isAuthenticated;
    if (this.success) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.router.navigate([""]);
    }
  }
}
