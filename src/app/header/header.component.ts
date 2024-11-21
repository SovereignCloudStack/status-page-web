import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserSettingsService } from '../services/user-settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public userSettings: UserSettingsService) {}

  hideDaysClass(): string {
    if (this.userSettings.useTableDisplay) {
      return "";
    }
    return "disabled";
  }
}
