import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SComponent, loadComponents } from '../model/component';
import { SIncident, loadIncidentUpdates, loadIncidents } from '../model/incident';
import { AppConfigService } from '../app-config.service';
import dayjs from 'dayjs';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  components!: SComponent[];
  incidents!: Map<string, SIncident>;
  dailyIncidents!: Map<string, SIncident[]>;
  loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private config: AppConfigService
  ) { }

  ngOnInit(): void {
    this.incidents = new Map();
    // Build map of days and the incidents happening on them
    this.dailyIncidents = new Map();
    let currentDate = dayjs();
    let startDate = currentDate.subtract(this.config.noOfDays, "days");
    this.dailyIncidents.set(currentDate.format("YYYY-MM-DD"), []);
    for (let i = 1; i < this.config.noOfDays; i++) {
      this.dailyIncidents.set(currentDate.subtract(i, "days").format("YYYY-MM-DD"), []);
    }
    // Start by loading the incidents
    loadIncidents(this.http, startDate, currentDate).subscribe(incidentList => {
      // For each incident, we also load the updates, but this can happen in parallel
      incidentList.forEach(incident => {
        incident.updates = [];
        loadIncidentUpdates(incident.id, this.http).subscribe(
          updateList => updateList.forEach(update => incident.updates.push(update))
        );
        this.incidents.set(incident.id, incident);
      }
      );
      // Once we are done loading all incidents (but not necessarily all updates), load the components
      loadComponents(this.http, this.incidents).subscribe(componentList => {
        this.components = componentList;
        // We are now fully loaded and can display the data
        this.loaded = true;
        console.log(this.components);
      });
    });
    
  }
}
