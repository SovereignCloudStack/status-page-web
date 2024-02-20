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

  loaded(): Observable<boolean> {
    return this.loadingFinished.asObservable();
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
        // TODO Handle incidents stretching more than one day
      }
      );
      // Once we are done loading all incidents (but not necessarily all updates), load the components
      loadComponents(this.http, this.incidentsById).subscribe(componentList => {
        this.components = componentList;
        this.components.forEach(component => {
          // Create daily data for each component
          for (let [day, incidents] of this.incidentsByDay) {
            let activeIncidents: SIncident[] = [];
            for (let incident of incidents) {
              // Check if the incident affects this component
              let affectingIncidentReferences = incident.affects.filter(c => c.reference === component.id);
              console.log(`Found ${affectingIncidentReferences.length} references to the current component (${component.displayName})`);
              for (let reference of affectingIncidentReferences) {
                activeIncidents.push(incident);
              }
            }
            component.dailyData.set(day, activeIncidents);
          }
        });
        // We are now fully loaded and can display the data
        this.loadingFinished.next(true);
        
        console.log(this.incidentsById);
        console.log(this.incidentsByDay);
        console.log(this.components);
        
      });
    });
  }
}
