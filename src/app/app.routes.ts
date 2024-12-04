import { Routes } from '@angular/router';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { StatusViewComponent } from './pages/status-view/status-view.component';
import { CookiesComponent } from './pages/cookies/cookies.component';
import { IncidentDetailsViewComponent } from './pages/incident-details-view/incident-details-view.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ManagementViewComponent } from './pages/management-view/management-view.component';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    {path: "", component: StatusViewComponent},
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "incident/:id",
        component: IncidentDetailsViewComponent
    },
    {
        path: "manage",
        component: ManagementViewComponent,
        canActivate: [autoLoginPartialRoutesGuard]
    },
    {path: "imprint", component: ImprintComponent},
    {path: "cookies", component: CookiesComponent},
    {path: "notfound", component: PageNotFoundComponent},
    {
        path: "unauthorized",
        component: UnauthorizedComponent
    },
    {path: "**", redirectTo: "notfound"}
];
