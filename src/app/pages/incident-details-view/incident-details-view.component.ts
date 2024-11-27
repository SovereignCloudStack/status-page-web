import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { ReversePipe } from '../../pipes/reverse.pipe';
import { Incident, Impact, IncidentService, IncidentUpdateResponseData, IncidentUpdate } from '../../../external/lib/status-page-api/angular-client';
import { ComponentId, IncidentId } from '../../model/base';
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

  incidentCopy: Incident = {};

  // These sets only include some form of ID we can use to
  // differentiate impacts/updates from each other. The actual
  // pending objects are stored in impactsToAdd/updatesToAdd.
  // Why? Because we can now quickly check if in the UI if
  // an impact or update is pending by calling the Set.has
  // method on the appropriate set. Furthermore, we can create
  // an overall array for iteration in the UI by using the 
  // spread operator.
  pendingImpacts: Set<ComponentId> = new Set();
  pendingUpdates: Set<number> = new Set();

  impactsToAdd: Impact[] = [];
  updatesToAdd: IncidentUpdateResponseData[] = [];

  impactsToDelete: Set<ComponentId> = new Set();
  updatesToDelete: Set<number> = new Set();

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

    // TODO Remove test data
    this.impactsToAdd.push({
      reference: "a27ff65b-2485-46a1-b63c-e8727c5cc81e",
      severity: 99,
      type: "7a556d8e-23e8-4d1b-8831-11cb82ba4a7f"
    });
    this.pendingImpacts.add("a27ff65b-2485-46a1-b63c-e8727c5cc81e");

    this.impactsToAdd.push({
      reference: "2d8972db-3b25-4837-a1dc-e54006b3ac9d",
      severity: 0,
      type: "07e2213d-d518-4900-aa7b-f874ec20c575"
    });
    this.pendingImpacts.add("2d8972db-3b25-4837-a1dc-e54006b3ac9d");
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        if (!params.has("id")) {
          this.router.navigate(["notfound"]);
          return;
        }
        const id = params.get("id")!;
        // TODO Handle special case for new incidents
        if (!this.data.incidents.has(id)) {
          this.router.navigate(["notfound"]);
          return;
        }
        this.incidentId = id;
        this.incident = this.data.incidents.get(id)!;
        this.incidentUpdates = this.data.incidentUpdates.get(this.incidentId) ?? [];
        // We create a copy of all the incident's values we might change so that
        // we can properly restore them in case the user discards any changes.
        this.incidentCopy = {
          displayName: this.incident.displayName,
          description: this.incident.description,
          beganAt: this.incident.beganAt,
          endedAt: this.incident.endedAt,
          phase: this.incident.phase
        };
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
    if (impact.severity === undefined || impact.severity === null) {
      console.error(`Found impact without severity value on incident ID ${this.incidentId}\nReference: ${impact.reference} Type: ${impact.type}`);
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
    // We start by making sure everything is in order, just to be sure.
    this.runChecks();
    // Format dates accordingly before sending to API
    this.incident.beganAt = uiToIncidentDate(this.startDate);
    if (this.endDate !== "") {
      this.incident.endedAt = uiToIncidentDate(this.endDate);
    } else {
      this.incident.endedAt = null;
    }
    // TODO Call API to save changes.
  }

  private discardChanges(): void {
    this.pendingImpacts.clear();
    this.pendingUpdates.clear();
    // TODO Clear out the actual pending objects
    this.impactsToDelete.clear();
    this.updatesToDelete.clear();
    this.incident.displayName = this.incidentCopy.displayName;
    this.incident.description = this.incidentCopy.description;
    this.incident.beganAt = this.incidentCopy.beganAt;
    this.incident.endedAt = this.incidentCopy.endedAt;
    this.incident.phase = this.incidentCopy.phase;
    this.resetStartDate();
    this.resetEndDate();
    this.currentErrors.clear();
  }

  private deleteIncident(): void {
    // TODO
  }

  resetStartDate(): void {
    this.startDate = incidentDateToUi(this.incident.beganAt);
  }

  resetEndDate(): void {
    this.endDate = incidentDateToUi(this.incident.endedAt);
  }

  markImpactForDeletion(id?: ComponentId): void {
    if (!id) {
      console.error("Received a call to markImpactForDeletion without an id");
      return;
    }
    if (this.pendingImpacts.has(id)) {
      this.pendingImpacts.delete(id);
      let index: number = 0;
      for (; index < this.impactsToAdd.length; index++) {
        if (this.impactsToAdd[index].reference === id) {
          break;
        }
      }
      this.impactsToAdd.splice(index, 1);
    } else {
      this.impactsToDelete.add(id);
    }
  }

  unmarkImpactForDeletion(id?: ComponentId): void {
    if (!id) {
      console.error("Received a call to unmarkImpactForDeletion without an id");
      return;
    }
    this.impactsToDelete.delete(id);
  }

  markUpdateForDeletion(order: number): void {
    // TODO What about updating the order property of all remaining pending updates?
    if (this.pendingUpdates.has(order)) {
      this.pendingUpdates.delete(order);
      let index: number = 0;
      for (; index < this.updatesToAdd.length; index++) {
        if (this.updatesToAdd[index].order === order) {
          break;
        }
      }
      this.updatesToAdd.splice(index, 1);
    } else {
      this.updatesToDelete.add(order);
    }
  }

  unmarkUpdateForDeletion(order: number): void {
    this.updatesToDelete.delete(order);
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
