import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-spinner-dialog',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './spinner-dialog.component.html',
  styleUrl: './spinner-dialog.component.css'
})
export class SpinnerDialogComponent {

  @Input()
  message?: string;

  @ViewChild("waitSpinnerDialog", {static: true})
  private dialogElement!: ElementRef<HTMLDialogElement>;

  openDialog(): void {
    this.dialogElement.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialogElement.nativeElement.close();
  }

  isOpen(): boolean {
    return this.dialogElement.nativeElement.open;
  }

  @Input()
  set done(d: boolean) {
    this.closeDialog();
  }
}
