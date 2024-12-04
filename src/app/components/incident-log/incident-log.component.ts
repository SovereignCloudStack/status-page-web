import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { IncidentLogListComponent } from '../incident-log-list/incident-log-list.component';

@Component({
  selector: 'app-incident-log',
  standalone: true,
  imports: [CommonModule, IncidentLogListComponent],
  templateUrl: './incident-log.component.html',
  styleUrl: './incident-log.component.css'
})
export class IncidentLogComponent {

  constructor(
    public data: DataService
  ) {}
}
