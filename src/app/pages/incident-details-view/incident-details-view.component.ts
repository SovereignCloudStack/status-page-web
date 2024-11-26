import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { ReversePipe } from '../../pipes/reverse.pipe';
import { Incident, Impact, IncidentService, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import { ImpactId, IncidentId } from '../../model/base';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { IconProviderService } from '../../services/icon-provider.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { EditMode } from '../../util/editmode'
import { incidentBeganAt, incidentDescription, incidentEndedAt, incidentName } from '../../util/checks';
import { FormsModule } from '@angular/forms';
import { Result, ResultId } from '../../util/result';
import { ErrorBoxComponent } from "../../components/error-box/error-box.component";
import { EditBarButtonsComponent } from "../../components/edit-bar-buttons/edit-bar-buttons.component";
import { incidentDateToUi, uiToIncidentDate } from '../../util/util';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe, FontAwesomeModule, SpinnerComponent, FormsModule, ErrorBoxComponent, EditBarButtonsComponent],
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

  startDate: string = "";
  endDate: string = "";

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
    this.edit.leaveEditFunction = this.dispatchEditLeave.bind(this);
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
        this.resetStartDate();
        this.resetEndDate();
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
    const originalStart = this.incident.beganAt;
    const originalEnd = this.incident.endedAt;
    this.incident.beganAt = uiToIncidentDate(this.startDate);
    this.incident.endedAt = uiToIncidentDate(this.endDate);
    this.checkError(incidentBeganAt);
    this.checkError(incidentEndedAt);
    this.incident.beganAt = originalStart;
    this.incident.endedAt = originalEnd;
  }

  checkError(checkFunction: (incident: Incident) => Result) {
    const result = checkFunction(this.incident);
    if (result.ok) {
      this.currentErrors.delete(result.id);
    } else {
      this.currentErrors.set(result.id, result);
    }
  }

  private dispatchEditLeave(label?: string) {
    if (!label) {
      console.error("Got an edit mode leave event without label");
      return;
    }
    switch(label) {
      case "save": {
        this.saveChanges();
        break;
      }
      case "discard": {
        this.discardChanges();
        break;
      }
      case "delete": {
        this.deleteIncident();
        break;
      }
      default: {
        console.error(`Got an edit mode leave event with unknown label: ${label}`);
      }
    }
  }

  private saveChanges(): void {
    // TODO Format dates accordingly before sending to API
  }

  private discardChanges(): void {
    this.resetStartDate();
    this.resetEndDate();
  }

  private deleteIncident(): void {

  }

  private resetStartDate(): void {
    this.startDate = incidentDateToUi(this.incident.beganAt);
  }

  private resetEndDate(): void {
    this.endDate = incidentDateToUi(this.incident.endedAt);
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
