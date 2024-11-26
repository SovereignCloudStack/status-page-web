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

  constructor(
    public ip: IconProviderService
  ) {}

}
