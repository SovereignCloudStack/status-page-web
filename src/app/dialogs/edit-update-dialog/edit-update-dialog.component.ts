import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IncidentUpdate, IncidentUpdateResponseData } from '../../../external/lib/status-page-api/angular-client';
import { Result, ResultId } from '../../util/result';
import { IconProviderService } from '../../services/icon-provider.service';
import { DataService } from '../../services/data.service';
import { UtilService } from '../../services/util.service';
import { updateDisplayName } from '../../util/checks';
import { ErrorBoxComponent } from '../../components/error-box/error-box.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { dayjsToUi, uiToIncidentDate } from '../../util/util';
import dayjs from 'dayjs';

@Component({
  selector: 'app-edit-update-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorBoxComponent, FontAwesomeModule],
  templateUrl: './edit-update-dialog.component.html',
  styleUrl: './edit-update-dialog.component.css'
})
export class EditUpdateDialogComponent implements OnInit {

  @Input()
  order!: number;

  update!: IncidentUpdateResponseData;

  currentErrors: Map<ResultId, Result> = new Map();

  allowSave: boolean = false;

  @Output()
  finish = new EventEmitter<IncidentUpdateResponseData>();
  @Output()
  cancel = new EventEmitter();

  @ViewChild("editUpdateDialog", {static: true})
  private dialogElement!: ElementRef<HTMLDialogElement>;

  constructor(
    public ip: IconProviderService,
    public data: DataService,
    public util: UtilService
  ) {

  }

  ngOnInit(): void {
    if (this.order === undefined) {
      this.order = 0;
    }
    this.update = {
      displayName: "",
      description: "",
      createdAt: dayjsToUi(dayjs()),
      order: this.order
    };
  }

  openDialog(): void {
    this.update = {
      displayName: "",
      description: "",
      createdAt: dayjsToUi(dayjs()),
      order: this.order
    };
    this.dialogElement.nativeElement.showModal();
  }

  finishDialog(): void {
    this.update.createdAt = uiToIncidentDate(this.update.createdAt!);
    this.finish.emit(this.update);
    this.dialogElement.nativeElement.close();
  }

  cancelDialog(): void {
    this.cancel.emit();
    this.dialogElement.nativeElement.close();
  }

  runChecks(): void {
    this.checkError(updateDisplayName);
    if (this.currentErrors.size > 0) {
      this.allowSave = false;
    } else {
      if (this.update.displayName !== "") {
        this.allowSave = true;
      }
    }
  }

  checkError(checkFunction: (update: IncidentUpdate) => Result) {
    const result = checkFunction(this.update);
    if (result.ok) {
      this.currentErrors.delete(result.id);
    } else {
      this.currentErrors.set(result.id, result);
    }
  }

  get createdAt(): string {
    return this.update.createdAt ?? "";
  }

  set createdAt(dt: string) {
    this.update.createdAt = dt;
  }
}
