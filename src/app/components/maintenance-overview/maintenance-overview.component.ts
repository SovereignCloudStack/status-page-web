import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../services/app-config.service';
import { DataService } from '../../services/data.service';
import { DatePipe } from '../../pipes/date.pipe';

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