import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserSettingsService } from '../../services/user-settings.service';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  
  showNewIncidentButton: boolean = false;

  constructor(
    public userSettings: UserSettingsService
  ) {}

  hideDaysClass(): string {
    if (this.userSettings.useTableDisplay) {
      return "";
    }
    return "disabled";
  }
}
