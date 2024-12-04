import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Incident } from '../../../external/lib/status-page-api/angular-client'; 
import { ReversePipe } from '../../pipes/reverse.pipe';
import { RouterModule } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { IncidentId } from '../../model/base';

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
