import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../app-config.service';
import { DataService } from '../data.service';
import { DatePipe } from '../date.pipe';

@Component({
  selector: 'app-maintenance-overview',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './maintenance-overview.component.html',
  styleUrl: './maintenance-overview.component.css'
})
export class MaintenanceOverviewComponent {

  constructor(
    protected config: AppConfigService,
    protected data: DataService
  ) {}
}
