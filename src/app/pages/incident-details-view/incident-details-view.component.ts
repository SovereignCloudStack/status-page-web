import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { ReversePipe } from '../../pipes/reverse.pipe';
import { Incident, Impact, IncidentService, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import { ComponentId, IncidentId } from '../../model/base';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { IconProviderService } from '../../services/icon-provider.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { EditMode } from '../../util/editmode'
import { incidentAffects, incidentBeganAt, incidentDescription, incidentEndedAt, incidentName } from '../../util/checks';
import { FormsModule } from '@angular/forms';
import { Result, ResultId } from '../../util/result';
import { ErrorBoxComponent } from "../../components/error-box/error-box.component";
import { EditBarButtonsComponent } from "../../components/edit-bar-buttons/edit-bar-buttons.component";
import { createIncident, incidentDateToUi, uiToIncidentDate } from '../../util/util';
import dayjs from 'dayjs';
import { EditImpactDialogComponent } from '../../dialogs/edit-impact-dialog/edit-impact-dialog.component';
import { EditUpdateDialogComponent } from '../../dialogs/edit-update-dialog/edit-update-dialog.component';
import { SpinnerDialogComponent } from '../../dialogs/spinner-dialog/spinner-dialog.component';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe, FontAwesomeModule, FormsModule, ErrorBoxComponent, EditBarButtonsComponent, EditImpactDialogComponent, SpinnerDialogComponent],
  templateUrl: './incident-details-view.component.html',
  styleUrl: './incident-details-view.component.css'
})
export class IncidentDetailsViewComponent implements OnInit {

  incidentId!: IncidentId;
  incident!: Incident;
  incidentUpdates!: IncidentUpdateResponseData[];

  // We create a copy of all the incident's values we might change so that
  // we can properly restore them in case the user discards any changes.
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

  newIncident: boolean = false;
  maintenanceEvent: boolean = false;

  @ViewChild("editImpactDialog", {static: true})
  private editImpactDialog!: ElementRef<EditImpactDialogComponent>;
  @ViewChild("waitSpinnerDialog")
  private waitSpinnerDialog!: ElementRef<SpinnerDialogComponent>;

  _waitState: string = "";

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
        if (id === "new") {
          this.incidentId = "";
          this.newIncident = true;
          const began = dayjs().utc();
          this.incident = createIncident(began);
          this.incidentCopy = createIncident(began);
          this.incidentUpdates = [];
        } else {
          if (this.data.incidents.has(id)) {
            this.incidentId = id;
            this.incident = this.data.incidents.get(id)!;
            // Make sure we definitely have an array in this field so that we can make
            // use of the non-null assertion operator (!) in good conscience.
            if (this.incident.affects === undefined) {
              this.incident.affects = [];
            }
            // Updates only supported for normal incidents
            this.incidentUpdates = this.data.incidentUpdates.get(this.incidentId) ?? [];
          } else if (this.data.hasMaintenanceEvent(id)) {
            this.incidentId = id;
            this.incident = this.data.getMaintenanceEvent(id)!;
            this.incidentUpdates = [];
            this.maintenanceEvent = true;
          } else {
            this.router.navigate(["notfound"]);
            return;
          }
          
          this.incidentCopy = {
            displayName: this.incident.displayName,
            description: this.incident.description,
            beganAt: this.incident.beganAt,
            endedAt: this.incident.endedAt,
            phase: {
              generation: this.incident.phase?.generation ?? 1,
              order: this.incident.phase?.order ?? 0
            }
          };
        }
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

  private applyChanges(): Incident {
    return {
      displayName: this.incident.displayName,
      description: this.incident.description,
      beganAt: uiToIncidentDate(this.startDate),
      endedAt: uiToIncidentDate(this.endDate),
      affects: this.incident.affects!
                .filter((impact) => !this.impactsToDelete.has(impact.reference!))
                .concat(this.impactsToAdd),
      phase: this.incident.phase
    }
  }

  runChecks(): Incident {
    const changedIncident = this.applyChanges();
    console.log(changedIncident);
    this.checkError(incidentName, changedIncident);
    this.checkError(incidentDescription, changedIncident);
    this.checkError(incidentBeganAt, changedIncident);
    this.checkError(incidentEndedAt, changedIncident);
    this.checkError(incidentAffects, changedIncident);
    return changedIncident;
  }

  private checkError(checkFunction: (incident: Incident) => Result, incident?: Incident) {
    if (!incident) {
      incident = this.applyChanges();
    }
    this.handleResult(checkFunction(incident));
  }

  private handleResult(result: Result): void {
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
    const editedIncident = this.runChecks();
    // Format dates accordingly before sending to API
    this.incident.beganAt = uiToIncidentDate(this.startDate);
    if (this.endDate !== "") {
      this.incident.endedAt = uiToIncidentDate(this.endDate);
    } else {
      this.incident.endedAt = null;
    }
    console.log(this.incident.affects);
    // Remove impacts and updates we are meant to remove
    this.incident.affects = (this.incident.affects!).filter((impact) => {
      return !this.impactsToDelete.has(impact.reference!);
    });
    console.log(this.incident.affects);
    this.incident.affects = [...this.incident.affects!, ...this.impactsToAdd];
    this.clearPending();
    // TODO Call API to save changes.
  }

  private discardChanges(): void {
    this.clearPending();
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

  private clearPending(): void {
    this.pendingImpacts.clear();
    this.pendingUpdates.clear();
    this.impactsToAdd = [];
    this.updatesToAdd = [];
    this.impactsToDelete.clear();
    this.updatesToDelete.clear();
  }

  resetStartDate(): void {
    this.startDate = incidentDateToUi(this.incidentCopy.beganAt);
  }

  resetEndDate(): void {
    console.log(incidentDateToUi(this.incidentCopy.endedAt));
    this.endDate = incidentDateToUi(this.incidentCopy.endedAt);
  }

  // Differs from resetEndDate by also calling runChecks. This is meant to be
  // used by the UI to remove the end date and mark the incident as still ongoing.
  // Running the checks is necessary to make sure any errors relating to the end
  // date are being cleared and we might not be in a state to properly do this when
  // calling resetEndDate in the init method, henceforth this additional method.
  removeEndDate(): void {
    this.resetEndDate();
    this.runChecks();
  }

  addNewImpact(impact: Impact): void {
    if (!impact.reference) {
      console.error("An Impact needs to reference a component");
      return;
    }
    if (this.pendingImpacts.has(impact.reference)) {
      console.error(`Attempt to add impact with the reference ${impact.reference} a second time`);
      return;
    }
    this.pendingImpacts.add(impact.reference);
    this.impactsToAdd.push(impact);
  }

  addNewUpdate(update: IncidentUpdateResponseData): void {
    if (this.pendingUpdates.has(update.order)) {
      console.error(`Attempt to add update with order ${update.order} a second time`);
      return;
    }
    this.pendingUpdates.add(update.order);
    this.updatesToAdd.push(update);
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
    this.checkError(incidentAffects);
  }

  unmarkImpactForDeletion(id?: ComponentId): void {
    if (!id) {
      console.error("Received a call to unmarkImpactForDeletion without an id");
      return;
    }
    this.impactsToDelete.delete(id);
    this.checkError(incidentAffects);
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

  // Getter and setter for use by the HTML select element for the phase.
  get incidentPhase(): number {
    return this.incident.phase?.order ?? 0;
  }

  set incidentPhase(phaseStr: string) {
    const phase = parseInt(phaseStr);
    if (!this.incident.phase) {
      this.incident.phase = {
        generation: 1,
        order: phase
      }
    } else {
      this.incident.phase.order = phase;
    }
  }

  get incidentType(): string {
    if (this.maintenanceEvent) {
      return "Maintenance Event";
    }
    return "Incident";
  }

  get waitState(): string {
    return this._waitState;
  }

  set waitState(state: string) {
    this._waitState = state;
    if (this._waitState === "" && this.waitSpinnerDialog.nativeElement.isOpen()) {
      this.waitSpinnerDialog.nativeElement.closeDialog();
    } else if (!this.waitSpinnerDialog.nativeElement.isOpen()) {
      this.waitSpinnerDialog.nativeElement.openDialog();
    }
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
