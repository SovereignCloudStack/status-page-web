import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Incident } from 'scs-status-page-api';
import { ReversePipe } from '../reverse.pipe';
import { RouterModule } from '@angular/router';
import { UtilService } from '../util.service';
import { IncidentId } from '../model/base';

@Component({
  selector: 'app-incident-log-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe],
  templateUrl: './incident-log-list.component.html',
  styleUrl: './incident-log-list.component.css'
})
export class IncidentLogListComponent {

  @Input() data: Map<string, [IncidentId, Incident][]> = new Map();

  constructor(
    public util: UtilService
  ) {}

  df = this.util.formatDate.bind(this.util)
  
}
