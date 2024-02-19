import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SComponent, loadComponents } from '../model/component';
import { SIncident, loadIncidentUpdates, loadIncidents } from '../model/incident';
import { AppConfigService } from '../app-config.service';
import dayjs from 'dayjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private config: AppConfigService,
    public data: DataService
  ) {}

  ngOnInit(): void {
    this.data.loaded().subscribe(loadStatus => {
      this.loaded = loadStatus;
    });
  }
}
