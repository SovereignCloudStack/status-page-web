import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserSettingsService } from '../user-settings.service';
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
