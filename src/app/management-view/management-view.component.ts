import { CommonModule } from '@angular/common';
import { Component, ElementRef, Signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare, faTrashCan, faSquarePlus, faFloppyDisk, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { UtilService } from '../util.service';
import { Incident, IncidentResponseData, IncidentService } from '../../external/lib/status-page-api/angular-client';
import dayjs from 'dayjs';
import { formatQueryDate } from '../model/base';
import { SpinnerComponent } from '../spinner/spinner.component';
import { OidcSecurityService, UserDataResult } from 'angular-auth-oidc-client';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AppConfigService } from '../app-config.service';

const DT_FORMAT = "YYYY-MM-DDTHH:mm";

@Component({
  selector: 'app-management-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, SpinnerComponent],
  templateUrl: './management-view.component.html',
  styleUrl: './management-view.component.css'
})
export class ManagementViewComponent {

  iconEdit = faPenToSquare;
  iconDelete = faTrashCan;
  iconNewIncident = faSquarePlus;
  iconSaveChanges = faFloppyDisk;
  iconDiscardChanges = faXmarkCircle;
  iconAddUpdate = faSquarePlus;
  iconDeleteUpdate = faTrashCan;

  editingIncidentId: string = "";
  editingIncident: Incident = {};

  maintenanceEvent: boolean = false;

  inputIsFine: boolean = true;
  errorMessage: string = "";

  @ViewChild("incidentDialog", {static: true})
  private incidentDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("inputIncidentName", {static: true})
  private inputIncidentName!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentDescription", {static: true})
  private inputIncidentDescription!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentStartDate", {static: true})
  private inputIncidentStartDate!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentEndDate", {static: true})
  private inputIncidentEndDate!: ElementRef<HTMLInputElement>;
  @ViewChild("inputIncidentPhase", {static: true})
  private inputPhaseSelect!: ElementRef<HTMLSelectElement>;

  @ViewChild("addAffectedComponentDialog", {static: true})
  private addComponentDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("inputAddComponentSelect", {static: true})
  private inputAddComponentSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputAddComponentType", {static: false})
  private inputAddComponentType!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputAddComponentSeverity", {static: false})
  private inputAddComponentSeverity!: ElementRef<HTMLInputElement>;

  @ViewChild("maintenanceEventDialog", {static: true})
  private maintenanceEventDialog!: ElementRef<HTMLDialogElement>;

  @ViewChild("waitSpinnerDialog")
  private waitSpinnerDialog!: ElementRef<HTMLDialogElement>;

  private userData!: Signal<UserDataResult>;

  constructor(
    public data: DataService,
    public util: UtilService,
    private config: AppConfigService,
    private security: OidcSecurityService,
    private router: Router,
    private incidentService: IncidentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.security.checkAuth().subscribe(async response => {
      console.log("checkAuth is running");
      if (!response.isAuthenticated) {
        console.log(`Unauthenticated, potential error: ${response.errorMessage}`);
        this.router.navigate([""]);
      }
      this.userData = this.security.userData;
      const token = await firstValueFrom(this.security.getAccessToken());this.incidentService.configuration.withCredentials = true;
      this.incidentService.defaultHeaders = this.incidentService.defaultHeaders.append("Authorization", `Bearer ${token}`);
      console.log("modified default headers");
    });
  }

  isNewIncident(): boolean {
    return this.editingIncidentId == "";
  }

  isMaintenanceEvent(): boolean {
    return this.maintenanceEvent;
  }

  editNewIncident(): void {
    let incident: Incident = {  
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
    console.log("called!");
    let event: Incident = {  
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

  editExistingIncident(incidentId: string, incidentToEdit: Incident): void {
    this.editingIncidentId = incidentId;
    this.editingIncident = incidentToEdit;
    this.inputPhaseSelect.nativeElement.selectedIndex = this.editingIncident.phase?.order ?? 0;
    this.incidentDialog.nativeElement.showModal();
  }

  editExistingMaintenanceEvent(incidentId: string, incidentToEdit: Incident): void {
    this.editingIncidentId = incidentId;
    this.editingIncident = incidentToEdit;
    this.maintenanceEvent = true;
    //this.inputPhaseSelect.nativeElement.selectedIndex = this.editingIncident.phase?.order ?? 0;
    this.maintenanceEventDialog.nativeElement.showModal();
  }

  createNewIncident(): void {
    // TODO Check for missing fields
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (this.inputIncidentEndDate.nativeElement.value) {
      this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
    }
    console.log(this.editingIncident);
    this.waitSpinnerDialog.nativeElement.showModal();
    this.handleResponse(this.data.createIncident(this.editingIncident), this.incidentDialog);
  }

  saveChanges() {
    // TODO Check for missing fields
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (this.inputIncidentEndDate.nativeElement.value) {
      this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
    }
    this.waitSpinnerDialog.nativeElement.showModal();
    this.handleResponse(this.data.updateIncident(this.editingIncidentId, this.editingIncident), this.incidentDialog);
  }

  cancelEditing() {
    if (this.isMaintenanceEvent()) {
      this.maintenanceEventDialog.nativeElement.close();
    } else {
      this.incidentDialog.nativeElement.close();
    }
    this.maintenanceEvent = false;
    this.editingIncidentId = "";
    this.editingIncident = {};
  }

  handleResponse<T>(o: Observable<T>, dialog: ElementRef<HTMLDialogElement>): void {
    o.subscribe({
      next: (value) => {
        this.editingIncident = {};
        this.editingIncidentId = "";
        // TODO Reload data 
        dialog.nativeElement.close();
        this.waitSpinnerDialog.nativeElement.close();
      },
      error: (err) => {
        console.error("API request error'ed out:");
        console.error(err);
        this.waitSpinnerDialog.nativeElement.close();
      },
      complete: () => {
        console.log("complete");
      }
    });
  }

  openAddAffectedComponentDialog() {
    this.addComponentDialog.nativeElement.showModal();
  }

  checkValidIncidentName(event: any) {
    let displayName = event.target.value;
    if (displayName == "") {
        this.errorMessage = "The incident's display name cannot be empty";
        this.inputIsFine = false;
        return;
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidReference(event: any) {
    let reference = event.target.value;
    for (let impact of this.editingIncident.affects ?? []) {
      if (impact.reference == reference) {
        this.errorMessage = `The incident already impacts the component ${this.util.componentName(reference)}`;
        this.inputIsFine = false;
        return;
      }
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidSeverity(event: any) {
    let severity = event.target.valueAsNumber;
    if (severity < 0 || severity > 100) {
      this.errorMessage = "The severity must be a value between 0 and 100";
      this.inputIsFine = false;
      return;
    }
    this.errorMessage = "";
    this.inputIsFine = true;
  }

  checkValidDate(dateName: string, event: any) {
    let dateStr = event.target.value;
    if (!dateStr) {
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
    console.log(this.editingIncident);
  }

  cancelAddComponent() {
    this.addComponentDialog.nativeElement.close();
  }

  currentDateTime(): string {
    let dt = dayjs().local();
    return dt.format(DT_FORMAT);
  }

  formatDateTime(dt: string | null | undefined): string {
    if (!dt) {
      return "";
    }
    return dayjs(dt).local().format(DT_FORMAT);
  }
}
