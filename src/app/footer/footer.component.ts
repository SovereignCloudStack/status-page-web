import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserSettingsService } from '../user-settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(public userSettings: UserSettingsService) {}
}
