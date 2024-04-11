import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { StatusViewComponent } from './status-view/status-view.component';
import { CookiesComponent } from './cookies/cookies.component';
import { IncidentDetailsViewComponent } from './incident-details-view/incident-details-view.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
    {path: "", component: StatusViewComponent},
    {path: "incident/:id", component: IncidentDetailsViewComponent},
    {path: "imprint", component: ImprintComponent},
    {path: "cookies", component: CookiesComponent},
    {path: "notfound", component: PageNotFoundComponent},
    {path: "**", redirectTo: "notfound"}
];
