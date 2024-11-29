import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { ReversePipe } from '../../pipes/reverse.pipe';
import { Incident, Impact, IncidentService, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import { ComponentId, IncidentId } from '../../model/base';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatestWith, firstValueFrom, forkJoin, Observable } from 'rxjs';
import { IconProviderService } from '../../services/icon-provider.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditMode } from '../../util/editmode'
import { incidentAffects, incidentBeganAt, incidentDescription, incidentEndedAt, incidentName } from '../../util/checks';
import { FormsModule } from '@angular/forms';
import { Result, ResultId } from '../../util/result';
import { ErrorBoxComponent } from "../../components/error-box/error-box.component";
import { EditBarButtonsComponent } from "../../components/edit-bar-buttons/edit-bar-buttons.component";
import { createIncident, incidentDateToUi, uiToDayjs, uiToIncidentDate } from '../../util/util';
import dayjs from 'dayjs';
import { EditImpactDialogComponent } from '../../dialogs/edit-impact-dialog/edit-impact-dialog.component';
import { EditUpdateDialogComponent } from '../../dialogs/edit-update-dialog/edit-update-dialog.component';
import { SpinnerDialogComponent } from '../../dialogs/spinner-dialog/spinner-dialog.component';

const WS_NONE = "";
const WS_NEW_INCIDENT = "Creating incident...";
const WS_PROCESSING_INCIDENT = "Updating incident...";
const WS_PROCESSING_UPDATES = "Sending updates...";
const WS_RELOADING = "Reloading data...";

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe, FontAwesomeModule, FormsModule, ErrorBoxComponent, EditBarButtonsComponent, EditImpactDialogComponent, EditUpdateDialogComponent, SpinnerDialogComponent],
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

  // New entities to add to this incident. Accompanying ID data
  // is stored in pendingImpacts and pendingUpdates, respectively.
  impactsToAdd: Impact[] = [];
  updatesToAdd: IncidentUpdateResponseData[] = [];

  // Impacts and updates we wish to delete.
  impactsToDelete: Set<ComponentId> = new Set();
  updatesToDelete: Set<number> = new Set();

  userAuthenticated: boolean = false;

  edit: EditMode;

  currentErrors: Map<ResultId, Result>;

  startDate: string = "";
  endDate: string = "";

  // We track the highest order number so far to make sure we have a key
  // we can use to differentiate IncidentUpdates from one another, even
  // those that have not yet been send to the API server.
  latestUpdateOrder: number = 0;

  newIncident: boolean = false;
  maintenanceEvent: boolean = false;

  @ViewChild("editImpactDialog", {static: true})
  private editImpactDialog!: ElementRef<EditImpactDialogComponent>;
  @ViewChild("waitSpinnerDialog", {static: false})
  private waitSpinnerDialog!: SpinnerDialogComponent;

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
  }

  ngOnInit(): void {
    // Check if the user is authenticated
    this.security.checkAuth().subscribe(async response => {
      this.userAuthenticated = response.isAuthenticated;
      if (this.userAuthenticated) {
        const token = await firstValueFrom(this.security.getAccessToken());
        this.incidentService.configuration.withCredentials = true;
        this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
      }
      this.route.paramMap.subscribe(params => {
        if (!params.has("id")) {
          this.router.navigate(["notfound"]);
          return;
        }
        const id = params.get("id")!;
        if (id === "new") {
          if (!this.userAuthenticated) {
            this.router.navigate(["unauthorized"]);
          }
          this.incidentId = "";
          this.newIncident = true;
          this.edit.switchMode();
          const began = dayjs().utc();
          this.incident = createIncident(began);
          this.incidentCopy = createIncident(began);
          this.incidentUpdates = [];
          // Run checks to make sure the save button is disabled
          this.runChecks();
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
            if (this.incidentUpdates.length > 0) {
              // Get the order number of the latest update and add one to get a new "key"
              // for our new updates. This order will be replaced with a 0 when send to the
              // API server, who'll assign its own order number.
              this.latestUpdateOrder = Math.max(...this.incident.updates!) + 1;
            }
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
      });
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
    if (this.currentErrors.size > 0) {
      // TODO Add some kind of notification.
      return;
    }
    this.waitState = WS_PROCESSING_INCIDENT;
    if (this.newIncident) {
      this.data.createIncident(this.incident).subscribe({
        next: (id) => {
          this.incidentId = id.id;
          this.handleSavingUpdates();
        },
        error: (err) => {
          console.error("Error occured while creating new incident");
          console.error(err);
        }
      })
    } else {
      this.data.updateIncident(this.incidentId, editedIncident).subscribe({
        next: () => {
          // Now, send or remove incident updates as needed.
          this.handleSavingUpdates();
        },
        error: (err) => {
          // Failure
          console.error(`Request to update incident ${this.incidentId} error'ed out`);
          console.error(err);
          // TODO What to do here?
        }
      });
    }
  }

  private handleSavingUpdates(): void {
    if (this.pendingUpdates.size > 0 || this.updatesToDelete.size > 0) {
      this.waitState = WS_PROCESSING_UPDATES;
      let requests: Observable<any>[] = [];
      for (let updateOrder of this.updatesToDelete) {
        requests.push(this.data.deleteIncidentUpdate(this.incidentId, updateOrder));
      }
      for (let update of this.updatesToAdd) {
        requests.push(this.data.createIncidentUpdate(this.incidentId, update));
      }
      forkJoin(requests).subscribe({
        error: (err) => {
          console.error("Request to add or delete incident update error'ed out.")
          console.error(err);
          // TODO What to do here?
        },
        complete: () => {
          this.finishSave();
        }
      });
    } else {
      this.finishSave(); 
    }
  }
  
  private finishSave(): void {
    this.waitState = WS_RELOADING;
    this.data.reload();
    this.data.loadingFinished.subscribe(loaded => {
      if (loaded) {
        // We are done reloading the data
        this.clearPending();
        this.waitState = WS_NONE;
        if (this.newIncident) {
          this.router.navigateByUrl(`/incident/${this.incidentId}`);
        }
      }
    });
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
    this.runChecks();
  }

  addNewUpdate(update: IncidentUpdateResponseData): void {
    if (this.pendingUpdates.has(update.order)) {
      console.error(`Attempt to add update with order ${update.order} a second time`);
      return;
    }
    this.pendingUpdates.add(update.order);
    this.updatesToAdd.push(update);
    this.latestUpdateOrder++;
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
    if (this._waitState === "" && this.waitSpinnerDialog.isOpen()) {
      this.waitSpinnerDialog.closeDialog();
    } else if (!this.waitSpinnerDialog.isOpen()) {
      this.waitSpinnerDialog.openDialog();
    }
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
