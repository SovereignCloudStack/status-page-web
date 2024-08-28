import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare, faTrashCan, faSquarePlus, faFloppyDisk, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { UtilService } from '../util.service';
import { Incident } from '../../external/lib/status-page-api/angular-client';
import dayjs from 'dayjs';
import { formatQueryDate } from '../model/base';
import { SpinnerComponent } from '../spinner/spinner.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';

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
  @ViewChild("inputAddComponentType", {static: true})
  private inputAddComponentType!: ElementRef<HTMLSelectElement>;
  @ViewChild("inputAddComponentSeverity", {static: true})
  private inputAddComponentSeverity!: ElementRef<HTMLInputElement>;

  @ViewChild("waitSpinnerDialog")
  private waitSpinnerDialog!: ElementRef<HTMLDialogElement>;

  constructor(
    public data: DataService,
    public util: UtilService,
    private security: OidcSecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.security.checkAuth().subscribe(response => {
      if (!response.isAuthenticated) {
        console.log(`Unauthenticated, potential error: ${response.errorMessage}`);
        this.router.navigate([""]);
      }
    });
  }

  isNewIncident() {
    return this.editingIncidentId == "";
  }

  editNewIncident() {
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

  editExistingIncident(incidentId: string, incidentToEdit: Incident) {
    this.editingIncidentId = incidentId;
    this.editingIncident = incidentToEdit;
    this.inputPhaseSelect.nativeElement.selectedIndex = this.editingIncident.phase?.order ?? 0;
    this.incidentDialog.nativeElement.showModal();
  }

  createNewIncident() {
    // TODO Check for missing fields
    this.editingIncident.displayName = this.inputIncidentName.nativeElement.value;
    this.editingIncident.description = this.inputIncidentDescription.nativeElement.value;
    this.editingIncident.beganAt = formatQueryDate(dayjs(this.inputIncidentStartDate.nativeElement.value).utc());
    if (this.inputIncidentEndDate.nativeElement.value) {
      this.editingIncident.endedAt = formatQueryDate(dayjs(this.inputIncidentEndDate.nativeElement.value).utc());
    }
    this.waitSpinnerDialog.nativeElement.showModal();
    this.data.createIncident(this.editingIncident).subscribe((response) => {
      console.log(`Creation attempt of incident was okay: ${response.ok}, gave ID ${response.body}`); 
      this.editingIncident = {};
      this.editingIncidentId = "";
      this.waitSpinnerDialog.nativeElement.close();
    });
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
    this.data.updateIncident(this.editingIncidentId, this.editingIncident).subscribe((response) => {
      console.log(`Update attempt of incident ${this.editingIncidentId} was okay: ${response.ok}`); 
      this.editingIncident = {};
      this.editingIncidentId = "";
      this.waitSpinnerDialog.nativeElement.close();
    });
  }

  cancelEditing() {
    this.incidentDialog.nativeElement.close();
    this.editingIncidentId = "";
    this.editingIncident = {};
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

  addAffectedComponent() {
    if (!this.editingIncident) {
      console.error("How can this be null?");
      return;
    }
    if (!this.editingIncident?.affects) {
      this.editingIncident.affects = [];
    }
    // TODO Check for missing fields
    this.editingIncident.affects.push({
      reference: this.inputAddComponentSelect.nativeElement.value,
      severity: Math.max(0, Math.min(100, this.inputAddComponentSeverity.nativeElement.valueAsNumber)),
      type: this.inputAddComponentType.nativeElement.value,
    });
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
