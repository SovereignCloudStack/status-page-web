import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private security: OidcSecurityService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (!params.has("code")) {
        console.error("URL is missing 'code' param");
        this.router.navigate(["notfound"]);
      }
      this.security.checkAuth().subscribe(response => {
        this.security.getAccessToken().subscribe(token => {
          this.router.navigate([""]);
        });
      });
    })
  }
}
