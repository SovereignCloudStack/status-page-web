import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Impact, Incident } from '../../../external/lib/status-page-api/angular-client';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProviderService } from '../../services/icon-provider.service';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { ErrorBoxComponent } from '../../components/error-box/error-box.component';
import { Result, ResultId } from '../../util/result';
import { impactReference, impactType } from '../../util/checks';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-edit-impact-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ErrorBoxComponent],
  templateUrl: './edit-impact-dialog.component.html',
  styleUrl: './edit-impact-dialog.component.css'
})
export class EditImpactDialogComponent implements OnInit {

  @Input()
  existingImpacts!: Impact[];

  impact!: Impact;

  currentErrors: Map<ResultId, Result> = new Map();

  allowSave: boolean = false;

  @ViewChild("editImpactDialog", {static: true})
  private dialogElement!: ElementRef<HTMLDialogElement>;

  @Output()
  finish = new EventEmitter<Impact>();
  @Output()
  cancel = new EventEmitter();

  constructor(
    public ip: IconProviderService,
    public data: DataService,
    public util: UtilService
  ) {}

  ngOnInit(): void {
    this.impact = {
      reference: "",
      severity: 1,
      type: ""
    };
  }

  openDialog(): void {
    this.impact = {
      reference: "",
      severity: 1,
      type: ""
    };
    this.dialogElement.nativeElement.showModal();
  }

  finishDialog(): void {
    this.finish.emit(this.impact);
    this.dialogElement.nativeElement.close();
  }

  cancelDialog(): void {
    this.cancel.emit();
    this.dialogElement.nativeElement.close();
  }

  runChecks(): void {
    this.checkError(impactReference);
    this.checkError(impactType);
    if (this.currentErrors.size > 0) {
      this.allowSave = false;
    } else {
      if (this.impact.reference !== "" && this.impact.type !== "") {
        this.allowSave = true;
      }
    }
    console.log(`Set allowSave to ${this.allowSave}`);
  }

  checkError(checkFunction: (impact: Impact, existing: Impact[]) => Result) {
    const result = checkFunction(this.impact, this.existingImpacts);
    if (result.ok) {
      this.currentErrors.delete(result.id);
    } else {
      this.currentErrors.set(result.id, result);
    }
  }
}
