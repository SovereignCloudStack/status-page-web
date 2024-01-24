import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserSettingsService } from '../user-settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ NgIf ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(public userSettings: UserSettingsService) {}
}
