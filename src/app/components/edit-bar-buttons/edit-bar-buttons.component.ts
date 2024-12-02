import { Component, Input } from '@angular/core';
import { EditMode } from '../../util/editmode';
import { IconProviderService } from '../../services/icon-provider.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-edit-bar-buttons',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './edit-bar-buttons.component.html',
  styleUrl: './edit-bar-buttons.component.css'
})
export class EditBarButtonsComponent {

  @Input()
  userAuthenticated!: boolean;

  @Input()
  edit!: EditMode;

  @Input()
  showDeleteButton: boolean = true;

  @Input()
  allowSaving: boolean = false;

  @Input()
  editBtnText: string = "Edit";
  @Input()
  saveBtnText: string = "Save Changes";
  @Input()
  discardBtnText: string = "Discard Changes";
  @Input()
  deleteBtnText: string = "Delete";

  constructor(
    public icons: IconProviderService
  ) {}

}
