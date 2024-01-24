import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { StatusViewComponent } from './status-view/status-view.component';
import { CookiesComponent } from './cookies/cookies.component';

export const routes: Routes = [
    {path: "", component: StatusViewComponent},
    {path: "imprint", component: ImprintComponent},
    {path: "cookies", component: CookiesComponent}
];
