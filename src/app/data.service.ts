import { Injectable } from '@angular/core';
import { SComponent, loadComponents } from './model/component';
import { SIncident, loadIncidentUpdates, loadIncidents } from './model/incident';
import dayjs from 'dayjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  components!: SComponent[];
  incidentsById!: Map<string, SIncident>;
  incidentsByDay!: Map<string, SIncident[]>;
  private loadingFinished: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private config: AppConfigService
  ) {
    this.loadingFinished = new BehaviorSubject(false);
    this.startLoading();
  }

  private startLoading(): void {
    this.incidentsById = new Map();
    // Build map of days and the incidents happening on them
    this.incidentsByDay = new Map();
    let currentDate = dayjs();
    let startDate = currentDate.subtract(this.config.noOfDays, "days");
    this.incidentsByDay.set(currentDate.format("YYYY-MM-DD"), []);
    for (let i = 1; i < this.config.noOfDays; i++) {
      this.incidentsByDay.set(currentDate.subtract(i, "days").format("YYYY-MM-DD"), []);
    }
    // Start by loading the incidents
    loadIncidents(this.http, startDate, currentDate).subscribe(incidentList => {
      // For each incident, we also load the updates, but this can happen in parallel
      incidentList.forEach(incident => {
        incident.updates = [];
        loadIncidentUpdates(incident.id, this.http).subscribe(
          updateList => updateList.forEach(update => incident.updates.push(update))
        );
        this.incidentsById.set(incident.id, incident);
        // Sort the incident into the map of incidents per day
        let incidentDate = incident.beganAt.split("T")[0];
        this.incidentsByDay.get(incidentDate)?.push(incident);
      }
      );
      // Once we are done loading all incidents (but not necessarily all updates), load the components
      loadComponents(this.http, this.incidentsById).subscribe(componentList => {
        this.components = componentList;
        // We are now fully loaded and can display the data
        this.loadingFinished.next(true);
        /*
        console.log(this.incidentsById);
        console.log(this.incidentsByDay);
        console.log(this.components);
        */
      });
    });
  }

  loaded(): Observable<boolean> {
    return this.loadingFinished.asObservable();
  }
}
