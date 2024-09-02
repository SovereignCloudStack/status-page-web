import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { StatusViewComponent } from './status-view/status-view.component';
import { CookiesComponent } from './cookies/cookies.component';
import { IncidentDetailsViewComponent } from './incident-details-view/incident-details-view.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ManagementViewComponent } from './management-view/management-view.component';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: "", component: StatusViewComponent},
    {
        path: "login",
        component: LoginComponent
    },
    {path: "incident/:id", component: IncidentDetailsViewComponent},
    {
        path: "manage", 
        component: ManagementViewComponent,
        canActivate: [autoLoginPartialRoutesGuard]
    },
    {path: "imprint", component: ImprintComponent},
    {path: "cookies", component: CookiesComponent},
    {path: "notfound", component: PageNotFoundComponent},
    {
        path: "forbidden",
        component: ForbiddenComponent,
        canActivate: [autoLoginPartialRoutesGuard]
    },
    {
        path: "unauthorized",
        component: UnauthorizedComponent
    },
    {path: "**", redirectTo: "notfound"}
];
