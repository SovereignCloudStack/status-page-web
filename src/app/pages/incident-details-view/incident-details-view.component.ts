import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule, NgFor } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { ReversePipe } from '../../pipes/reverse.pipe';
import { Incident, Impact, IncidentService, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import { ImpactId, IncidentId } from '../../model/base';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { IconProviderService } from '../../services/icon-provider.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { EditMode } from '../../model/editmode'
import { incidentBeganAt, incidentDescription, incidentEndedAt, incidentName } from '../../model/checks';
import { FormsModule } from '@angular/forms';
import { Result, ResultId } from '../../model/result';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe, FontAwesomeModule, SpinnerComponent, FormsModule],
  templateUrl: './incident-details-view.component.html',
  styleUrl: './incident-details-view.component.css'
})
export class IncidentDetailsViewComponent implements OnInit {

  incidentId!: IncidentId;
  incident!: Incident;
  incidentUpdates!: IncidentUpdateResponseData[];

  pendingImpacts: ImpactId[] = [];
  pendingUpdates: number[] = [];

  userAuthenticated: boolean = false;

  edit: EditMode;

  currentErrors: Map<ResultId, Result>;

  displayName: string = "";

  constructor(
    public data: DataService,
    public util: UtilService,
    public ip: IconProviderService,
    private route: ActivatedRoute,
    private router: Router,
    private security: OidcSecurityService,
    private incidentService: IncidentService
  ) {
    this.edit = new EditMode();
    this.currentErrors = new Map();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        if (!params.has("id")) {
          this.router.navigate(["notfound"]);
          return;
        }
        const id = params.get("id")!;
        if (!this.data.incidents.has(id)) {
          this.router.navigate(["notfound"]);
          return;
        }
        this.incidentId = id;
        this.incident = this.data.incidents.get(id)!;
        this.incidentUpdates = this.data.incidentUpdates.get(this.incidentId) ?? [];
      }
    );
    // Check if the user is authenticated
    this.security.checkAuth().subscribe(async response => {
      this.userAuthenticated = response.isAuthenticated;
      if (this.userAuthenticated) {
        const token = await firstValueFrom(this.security.getAccessToken());
        this.incidentService.configuration.withCredentials = true;
        this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
      }
    });
  }

  componentName(impact: Impact): string {
    if (!impact.reference) {
      console.error(`Found impact without reference to a component on incident ${this.incidentId}`);
      return "";
    }
    const component = this.data.components.get(impact.reference);
    if (!component) {
      console.error(`No component for impact reference ${impact.reference} found (incident: ${this.incidentId})`);
      return "";
    }
    if (!component.displayName) {
      console.error(`Component ${impact.reference} has no display name (incident: ${this.incidentId})`);
      return "";
    }
    return component.displayName;
  }

  impactType(impact: Impact): string {
    if (!impact.type) {
      return "unknown";
    }
    return this.data.impactTypeName(impact.type);
  }

  impactSeverity(impact: Impact): string {
    if (!impact.severity) {
      console.error(`Found impact without severity value on incident ID ${this.incidentId}`);
      return "";
    }
    return `${this.util.severityName(impact.severity)} (${impact.severity})`;
  }

  runChecks() {
    this.checkError(incidentName);
    this.checkError(incidentDescription);
    this.checkError(incidentBeganAt);
    this.checkError(incidentEndedAt);
  }

  checkError(checkFunction: (incident: Incident) => Result) {
    const result = checkFunction(this.incident);
    if (result.ok) {
      this.currentErrors.delete(result.id);
    } else {
      this.currentErrors.set(result.id, result);
    }
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
