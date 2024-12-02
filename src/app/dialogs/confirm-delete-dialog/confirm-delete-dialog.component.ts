import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Incident } from '../../../external/lib/status-page-api/angular-client';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProviderService } from '../../services/icon-provider.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.css'
})
export class ConfirmDeleteDialogComponent {

  @Input()
  incident!: Incident;

  @Input()
  maintenanceEvent: boolean = false;

  @Output()
  confirm = new EventEmitter()
  @Output()
  cancel = new EventEmitter();

  @ViewChild("confirmDeleteDialog")
  private dialog!: ElementRef<HTMLDialogElement>

  constructor(
    public icons: IconProviderService
  ) {}

  userConfirms(): void {
    this.confirm.emit();
    this.dialog.nativeElement.close();
  }

  userCancels(): void {
    this.cancel.emit();
    this.dialog.nativeElement.close();
  }

  openDialog(): void {
    this.dialog.nativeElement.showModal();
  }
}
