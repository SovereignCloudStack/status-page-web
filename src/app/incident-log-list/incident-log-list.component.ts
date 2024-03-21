import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FIncident } from '../model/frontend/incident';
import { ReversePipe } from '../reverse.pipe';
import { RouterModule } from '@angular/router';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-incident-log-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe],
  templateUrl: './incident-log-list.component.html',
  styleUrl: './incident-log-list.component.css'
})
export class IncidentLogListComponent {

  @Input() data: Map<string, FIncident[]> = new Map();

  constructor(
    public util: UtilService
  ) {}

  df = this.util.formatDate.bind(this.util)
  
}
