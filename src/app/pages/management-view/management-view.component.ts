import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UtilService } from '../../services/util.service';
import { Incident, IncidentService, IncidentUpdate, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import dayjs from 'dayjs';
import { formatQueryDate, IncidentId } from '../../model/base';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { OidcSecurityService, UserDataResult } from 'angular-auth-oidc-client';
import { firstValueFrom, Observable } from 'rxjs';
import { AppConfigService } from '../../services/app-config.service';
import { IconProviderService } from '../../services/icon-provider.service';

const DT_FORMAT = "YYYY-MM-DDTHH:mm";

const WS_NONE = "This should never be visible";
const WS_PROCESSING = "Processing request...";
const WS_RELOADING = "Reloading data...";

@Component({
  selector: 'app-management-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, SpinnerComponent],
  templateUrl: './management-view.component.html',
  styleUrl: './management-view.component.css'
})
export class ManagementViewComponent implements OnInit{

  editingIncidentId: string = "";
  editingIncident: Incident = {};

  editingUpdate: IncidentUpdate = {};
  // Used as a queue to hold any updates we need to process
  // when saving our changes to an incident.
  // Use push to add and shift to extract.
  newUpdatesToProcess: IncidentUpdateResponseData[] = [];
  updateDeletionsToProcess: number[] = [];

  maintenanceEvent: boolean = false;

  inputIsFine: boolean = true;
  errorMessage: string = "";

  waitState: string = "";

  @ViewChild("incidentDialog", {static: true})
  private incidentDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("inputIncidentName", {static: true})
  private inputIncidentName!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentDescription", {static: true})
  private inputIncidentDescription!: ElementRef<HTMLTextAreaElement>;
  @ViewChild("inputIncidentStartDate", {static: true})
  private inputIncidentStartDate!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentEndDate", {static: true})
  private inputIncidentEndDate!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentPhase", {static: true})
  private inputIncidentPhase!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputIncidentImpact", {static: false})
  private inputIncidentImpact!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputIncidentUpdate", {static: false})
  private inputIncidentUpdate!: ElementRef<HTMLSelectElement>;

  @ViewChild("addAffectedComponentDialog", {static: true})
  private addComponentDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("inputAddComponentSelect", {static: true})
  private inputAddComponentSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputAddComponentType", {static: false})
  private inputAddComponentType!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputAddComponentSeverity", {static: false})
  private inputAddComponentSeverity!: ElementRef<HTMLInputElement>;

  @ViewChild("createUpdateDialog", {static: true})
  private addUpdateDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("inputUpdateName", {static: true})
  private inputUpdateName!: ElementRef<HTMLInputElement>;
  @ViewChild("inputUpdateDescription", {static: true})
  private inputUpdateDescription!: ElementRef<HTMLTextAreaElement>;

  @ViewChild("confirmDeletionDialog", {static: true})
  private confirmDeletionDialog!: ElementRef<HTMLDialogElement>;

  @ViewChild("waitSpinnerDialog")
  private waitSpinnerDialog!: ElementRef<HTMLDialogElement>;

  private userData!: Signal<UserDataResult>;

  constructor(
    public data: DataService,
    public util: UtilService,
    public ip: IconProviderService,
    private config: AppConfigService,
    private security: OidcSecurityService,
    private router: Router,
    private incidentService: IncidentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.security.checkAuth().subscribe(async response => {
      if (!response.isAuthenticated) {
        console.log(`Unauthenticated, potential error: ${response.errorMessage}`);
        this.router.navigate([""]);
      }
      this.userData = this.security.userData;
      const token = await firstValueFrom(this.security.getAccessToken());
      this.incidentService.configuration.withCredentials = true;
      this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.set("Authorization", `Bearer ${token}`);
    });
  }

  isNewIncident(): boolean {
    return this.editingIncidentId == "";
  }

  isMaintenanceEvent(): boolean {
    return this.maintenanceEvent;
  }

  editNewIncident(): void {
    const incident: Incident = {
      displayName: "",
      description: "",
      beganAt: formatQueryDate(dayjs().utc()),
      endedAt: null,
      phase: {
        generation: 1,
        order: 0
      },
      affects: [],
      updates: []
    };
    this.editExistingIncident("", incident);
  }

  editNewMaintenanceEvent(): void {
    const event: Incident = {
      displayName: "",
      description: "",
      beganAt: formatQueryDate(dayjs().utc()),
      endedAt: null,
      phase: {
        generation: 1,
        order: 0
      },
      affects: [],
      updates: []
    };
    this.editExistingMaintenanceEvent("", event);
  }

  editNewUpdate(): void {
    this.editingUpdate = {
      displayName: "",
      description: "",
      createdAt: null,
    };
    this.addUpdateDialog.nativeElement.showModal();
  }

  editExistingIncident(incidentId: string, incidentToEdit: Incident): void {
    this.editingIncidentId = incidentId;
    this.editingIncident = incidentToEdit;
    this.inputIncidentPhase.nativeElement.selectedIndex = this.editingIncident.phase?.order ?? 0;
    this.incidentDialog.nativeElement.showModal();
  }

  editExistingMaintenanceEvent(incidentId: string, incidentToEdit: Incident): void {
    this.editingIncidentId = incidentId;
    this.editingIncident = incidentToEdit;
    this.maintenanceEvent = true;
    this.inputIncidentPhase.nativeElement.selectedIndex = this.editingIncident.phase?.order ?? 0;
    this.incidentDialog.nativeElement.showModal();
  }

  createNewIncident(): void {
    // TODO Check for missing fields
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (this.inputIncidentEndDate.nativeElement.value) {
      this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
    }
    if (!this.editingIncident.phase) {
      this.editingIncident.phase = {
        generation: 1,
        order: 0
      };
    }
    this.editingIncident.phase.order = parseInt(this.inputIncidentPhase.nativeElement.value) ?? 0;
    this.waitState = WS_PROCESSING;
    this.waitSpinnerDialog.nativeElement.showModal();
    this.handleResponse(this.data.createIncident(this.editingIncident), this.incidentDialog);
  }

  createNewMaintenanceEvent(): void {
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (this.inputIncidentEndDate.nativeElement.value) {
      this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
    }
    this.waitState = WS_PROCESSING;
    this.waitSpinnerDialog.nativeElement.showModal();
    this.handleResponse(this.data.createIncident(this.editingIncident), this.incidentDialog);
  }

  enqueueNewUpdate(): void {
    this.editingUpdate.displayName = this.inputUpdateName.nativeElement.value;
    this.editingUpdate.description = this.inputUpdateDescription.nativeElement.value;
    this.editingUpdate.createdAt = formatQueryDate(dayjs().utc());
    const update = this.editingUpdate as IncidentUpdateResponseData;
    // We use a temporary order number to be able to delete updates that have not yet
    // been saved to the API server. To make it possible to differentiate this order
    // number from an ordinary one, we use negative numbers.
    update.order = -(this.newUpdatesToProcess.length + 1);
    this.newUpdatesToProcess.push(update);
    this.editingUpdate = {};
    this.addUpdateDialog.nativeElement.close();
  }

  saveChanges() {
    // TODO Check for missing fields
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (!this.maintenanceEvent) {
      if (this.inputIncidentEndDate.nativeElement.value) {
        this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
      } else {
        this.editingIncident.endedAt = null;
      }
    } else {
      if (this.inputIncidentEndDate.nativeElement.value) {
        this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
      } else {
        // Error state, maintenance events need an end date
        this.inputIsFine = false;
        this.errorMessage = "A maintenance event must have an end date";
        return;
      }
    }
    if (!this.editingIncident.phase) {
      this.editingIncident.phase = {
        generation: 1,
        order: 0
      };
    }
    this.editingIncident.phase.order = parseInt(this.inputIncidentPhase.nativeElement.value);
    this.waitState = WS_PROCESSING;
    this.waitSpinnerDialog.nativeElement.showModal();
    // Delete any updates that should be removed
    while(this.updateDeletionsToProcess.length > 0) {
      const order = this.updateDeletionsToProcess.shift();
      if (order !== undefined) {
        this.incidentService.deleteIncidentUpdate(this.editingIncidentId, order).subscribe(
          {
            next: () => {
            },
            error: err => {
              console.error(`Request to delete update ${order} of incident ${this.editingIncidentId} error'ed out:`);
              console.error(err);
            }
          }
        );
      }
    }
    // Check if we need to process new updates to this incident
    while (this.newUpdatesToProcess.length > 0) {
      const update = this.newUpdatesToProcess.shift();
      if (update) {
        this.incidentService.createIncidentUpdate(this.editingIncidentId, update).subscribe(
          {
            next: value => {
              update.order = value["order"];
            },
            error: err => {
              // TODO How to best deal with these errors?
              console.error(`Request to add update ${update.displayName} for incident ${this.editingIncidentId} error'ed out`);
              console.error(err);
            }
          }
        );
      }
    }
    this.handleResponse(this.data.updateIncident(this.editingIncidentId, this.editingIncident), this.incidentDialog);
  }

  cancelEditing() {
    this.incidentDialog.nativeElement.close();
    this.maintenanceEvent = false;
    this.editingIncidentId = "";
    this.editingIncident = {};
    this.editingUpdate = {};
    this.updateDeletionsToProcess = [];
    this.newUpdatesToProcess = [];
  }

  deleteImpact(): void {
    const impactReference = this.inputIncidentImpact.nativeElement.value;
    this.editingIncident.affects = this.editingIncident.affects?.filter(impact => impact.reference !== impactReference);
  }

  enqueueDeleteUpdate(): void {
    const order = parseInt(this.inputIncidentUpdate.nativeElement.value);
    if (order >= 0) {
      // The update is already on the server, enqueue it.
      this.updateDeletionsToProcess.push(order);
    } else {
      // The update has not yet been send to the server, we can simply
      // remove it from the queue of updates still to be saved.
      this.newUpdatesToProcess = this.newUpdatesToProcess.filter(update => update.order !== order);
    }
  }

  prepareDeleteIncident(incidentId: IncidentId, incident: Incident, maintenanceEvent: boolean = false): void {
    this.editingIncidentId = incidentId;
    this.editingIncident = incident;
    if (maintenanceEvent) {
      this.maintenanceEvent = true;
    }
    this.confirmDeletionDialog.nativeElement.showModal();
  }

  confirmDeleteIncident(): void {
    this.waitSpinnerDialog.nativeElement.showModal();
    this.handleResponse(
      this.incidentService.deleteIncident(this.editingIncidentId),
      this.confirmDeletionDialog
    )
  }

  cancelDeleteIncident(): void {
    this.confirmDeletionDialog.nativeElement.close();
    this.editingIncidentId = "";
    this.editingIncident = {};
    this.maintenanceEvent = false;
  }

  handleResponse<T>(o: Observable<T>, dialog: ElementRef<HTMLDialogElement>): void {
    o.subscribe({
      next: () => {
        this.editingIncident = {};
        this.editingIncidentId = "";
        this.maintenanceEvent = false;
        this.waitState = WS_RELOADING;
        // Reload data in DataService
        this.data.reload();
        this.data.loadingFinished.subscribe(loaded => {
          if (loaded) {
            // Data is available again, close the dialog and the wait spinner
            dialog.nativeElement.close();
            this.waitSpinnerDialog.nativeElement.close();
            this.waitState = WS_NONE;
          }
        })
      },
      error: (err) => {
        console.error("API request error'ed out:");
        console.error(err);
        this.waitSpinnerDialog.nativeElement.close();
      },
      complete: () => {
      }
    });
  }

  openAddAffectedComponentDialog() {
    this.addComponentDialog.nativeElement.showModal();
  }

  checkValidIncidentName(event: Event) {
    const incidentDisplayNameInput = event.target as HTMLInputElement;
    if (incidentDisplayNameInput.value == "") {
        this.errorMessage = "The display name cannot be empty";
        this.inputIsFine = false;
        return;
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidReference(event: Event) {
    const referenceSelect = event.target as HTMLSelectElement;
    for (const impact of this.editingIncident.affects ?? []) {
      if (impact.reference == referenceSelect.value) {
        this.errorMessage = `The incident already impacts the component ${this.util.componentName(referenceSelect.value)}`;
        this.inputIsFine = false;
        return;
      }
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidSeverity(event: Event) {
    const severityInput = event.target as HTMLInputElement;
    if (severityInput.valueAsNumber < 0 || severityInput.valueAsNumber > 100) {
      this.errorMessage = "The severity must be a value between 0 and 100";
      this.inputIsFine = false;
      return;
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidDate(dateName: string, necessary: boolean, event: Event) {
    const dateInput = event.target as HTMLInputElement
    if (necessary && !dateInput.value) {
      this.errorMessage = `The ${dateName} cannot be empty`;
      this.inputIsFine = false;
      return;
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  addAffectedComponent() {
    if (!this.editingIncident) {
      console.error("How can this be null?");
      return;
    }
    if (!this.editingIncident?.affects) {
      this.editingIncident.affects = [];
    }
    // TODO Check for missing fields
    if (!this.isMaintenanceEvent()) {
      this.editingIncident.affects.push({
        reference: this.inputAddComponentSelect.nativeElement.value,
        severity: Math.max(0, Math.min(100, this.inputAddComponentSeverity.nativeElement.valueAsNumber)),
        type: this.inputAddComponentType.nativeElement.value,
      });
    } else {
      this.editingIncident.affects.push({
        reference: this.inputAddComponentSelect.nativeElement.value,
        severity: 0,
        type: this.inputAddComponentType.nativeElement.value,
      });
    }
    this.addComponentDialog.nativeElement.close();
  }

  cancelAddComponent():void {
    this.addComponentDialog.nativeElement.close();
  }

  cancelNewUpdate(): void {
    this.addUpdateDialog.nativeElement.close();
    this.editingUpdate = {};
  }

  currentDateTime(): string {
    const dt = dayjs().local();
    return dt.format(DT_FORMAT);
  }

  formatDateTime(dt: string | null | undefined): string {
    if (!dt) {
      return "";
    }
    return dayjs(dt).local().format(DT_FORMAT);
  }
}
