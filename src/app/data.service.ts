import { Injectable } from '@angular/core';
import { loadComponents } from './model/server/component';
import { loadIncidents } from './model/server/incident';
import dayjs from 'dayjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { BehaviorSubject, Observable, combineLatestWith } from 'rxjs';
import { FIncident } from './model/frontend/incident';
import { FComponent } from './model/frontend/component';
import { DailyStatus } from './model/frontend/daily-status';
import { loadIncidentUpdates } from './model/server/incident-update';
import { SPhaseGeneration, loadPhases } from './model/server/phase';
import { SImpactTypes, loadImpactTypes } from './model/server/impact-types';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  phaseGenerations: SPhaseGeneration;
  impactTypes: Map<string, SImpactTypes>;

  components!: FComponent[];
  incidentsById!: Map<string, FIncident>;
  incidentsByDay!: Map<string, FIncident[]>;
  ongoingIncidents!: Map<string, FIncident[]>;
  completedIncidents!: Map<string, FIncident[]>;

  private loadingFinished: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private config: AppConfigService
  ) {
    this.phaseGenerations = {generation: 0, phases: []};
    this.impactTypes = new Map();

    this.components = [];
    this.incidentsById = new Map();
    this.incidentsByDay = new Map();
    this.ongoingIncidents = new Map();
    this.completedIncidents = new Map();

    this.loadingFinished = new BehaviorSubject(false);
    
    this.startLoading();
  }

  loaded(): Observable<boolean> {
    return this.loadingFinished.asObservable();
  }

  private addIncidentToMap(map: Map<string, FIncident[]>, incidentDate: string, incident: FIncident): void {
    let list = map.get(incidentDate) ?? [];
    list.push(incident);
    map.set(incidentDate, list);
  }

  private startLoading(): void {
    
    let phases$ = loadPhases(this.http);
    let impactTypes$ = loadImpactTypes(this.http);

    phases$.pipe(
      combineLatestWith(impactTypes$)
    ).subscribe(([phases, impacts]) => {
      this.phaseGenerations = phases;
      impacts.forEach(impact => {
        this.impactTypes.set(impact.id, impact);
      });
      this.loadMainData();
    });
  }

  private loadMainData(): void {
    // Build map of days and the incidents happening on them
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
        let frontendIncident = new FIncident(incident, this.phaseGenerations);
        loadIncidentUpdates(incident.id, this.http).subscribe(
          updateList => updateList.forEach(update => frontendIncident.addUpdate(update))
        );
        this.incidentsById.set(incident.id, frontendIncident);
        // Sort the incident into the map of incidents per day
        let incidentDate = incident.beganAt.format("YYYY-MM-DD");
        this.incidentsByDay.get(incidentDate)?.push(frontendIncident);
        if (frontendIncident.endedAt === null) {
          // Incident is still ongoing, add it to the appropriate list
          this.addIncidentToMap(this.ongoingIncidents, incidentDate, frontendIncident);
        } else {
          this.addIncidentToMap(this.completedIncidents, incidentDate, frontendIncident);
        }
        // TODO Handle incidents stretching more than one day
      }
      );
      // Once we are done loading all incidents (but not necessarily all updates), load the components
      loadComponents(this.http).subscribe(componentList => {
        componentList.forEach(component => {
          let frontendComponent = new FComponent(component);
          this.components.push(frontendComponent);
          // Create daily data for each component
          for (let [day, incidents] of this.incidentsByDay) {
            let dailyData = new DailyStatus(day);
            for (let incident of incidents) {
              // Check if the incident affects this component
              let affectingIncidentReferences = incident.serverSide.affects.filter(c => c.reference === component.id);
              for (let reference of affectingIncidentReferences) {
                dailyData.addIncident(incident);
              }
            }
            frontendComponent.dailyData.set(day, dailyData);
          }
          frontendComponent.calculateAvailability();
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
