import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserSettingsService } from '../user-settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public userSettings: UserSettingsService) {}
}
