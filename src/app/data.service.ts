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
    this.phaseGenerations = { generation: 0, phases: [] };
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

  // private addIncidentToMap(
  //   map: Map<string, FIncident[]>,
  //   incident: FIncident,
  //   incidentDate: string,
  //   currentDate: string,
  //   dateRange: string[]
  // ): void {
  //   let startIndex = dateRange.findIndex(v => v === incidentDate);
  //   let endDate = incident.endedAt?.format("YYYY-MM-DD");
  //   if (!endDate) {
  //     endDate = currentDate;
  //   }
  //   let endIndex = dateRange.findIndex(v => v === endDate);
  //   for (let i = startIndex; i <= endIndex; i++) {
  //     let list = map.get(dateRange[i]) ?? [];
  //     list.push(incident);
  //     map.set(dateRange[i], list);
  //   }
  // }

  private addIncidentToMap(
    map: Map<string, FIncident[]>,
    incident: FIncident,
    incidentDate: string
  ): void {
    const list = map.get(incidentDate) ?? [];
    list.push(incident);
    map.set(incidentDate, list);
  }

  private startLoading(): void {

    const phases$ = loadPhases(this.http);
    const impactTypes$ = loadImpactTypes(this.http);

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
    const currentDate = dayjs();
    const currentDateStr = currentDate.format("YYYY-MM-DD");
    const startDate = currentDate.subtract(this.config.noOfDays, "days");
    const dateRange: string[] = [];
    this.incidentsByDay.set(currentDateStr, []);
    dateRange[this.config.noOfDays - 1] = currentDateStr;
    for (let i = 1; i < this.config.noOfDays; i++) {
      const dateStr = currentDate.subtract(i, "days").format("YYYY-MM-DD");
      dateRange[this.config.noOfDays - 1 - i] = dateStr;
      this.incidentsByDay.set(dateStr, []);
    }
    // Start by loading the incidents
    loadIncidents(this.http, this.config, startDate, currentDate).subscribe(incidentList => {
      // For each incident, we also load the updates, but this can happen in parallel
      incidentList.forEach(incident => {
        const frontendIncident = new FIncident(incident, this.phaseGenerations);
        loadIncidentUpdates(this.config, incident.id, this.http).subscribe(
          updateList => updateList.forEach(update => frontendIncident.addUpdate(update))
        );
        this.incidentsById.set(incident.id, frontendIncident);
        // Sort the incident into the map of incidents per day
        const incidentDate = incident.beganAt.format("YYYY-MM-DD");
        this.incidentsByDay.get(incidentDate)?.push(frontendIncident);
        if (frontendIncident.endedAt === null) {
          // Incident is still ongoing, add it to the appropriate list
          this.addIncidentToMap(this.ongoingIncidents, frontendIncident, incidentDate);
        } else {
          this.addIncidentToMap(this.completedIncidents, frontendIncident, incidentDate);
        }
      }
      );
      // Once we are done loading all incidents (but not necessarily all updates), load the components
      loadComponents(this.http, this.config).subscribe(componentList => {
        componentList.forEach(component => {
          const frontendComponent = new FComponent(component);
          this.components.push(frontendComponent);
          // Create daily data for each component
          for (const [day, incidents] of this.incidentsByDay) {
            const dailyData = new DailyStatus(day);
            for (const incident of incidents) {
              // Check if the incident affects this component
              const affectingIncidentReferences = incident.serverSide.affects.filter(c => c.reference === component.id);
              for (const reference of affectingIncidentReferences) {
                // We traverse the list twice. In the first traversal, we only update the
                // incidents. By the end of it, they will have not only all the necessary
                // references, but the maximum severity amongst the affected components will
                // also be updated to the correct value.
                // TODO This whole initialization step could benefit from a cleaner rewite.
                incident.addAffectedComponent(frontendComponent, reference.severity);
              }
              for (const reference of affectingIncidentReferences) { // eslint-disable-line @typescript-eslint/no-unused-vars
                // NOW we can update the DailyStatus objects without ending up
                // using incomplete severities, which would happen if we didn't
                // traverse the list twice or added the incidents to the daily
                // status BEFORE we updated the incidents themselves.
                // So, no matter how tempting: Don't refactor this into a single list traversal.
                dailyData.addIncident(incident);
              }
            }
            frontendComponent.dailyData.set(day, dailyData);
          }
          frontendComponent.calculateAvailability();
        });
        // Go over the list of components again and handle incidents stretching more than one day
        this.components.forEach(component => { // eslint-disable-line @typescript-eslint/no-unused-vars
          const processedIncidents: string[] = [];
          component.dailyData.forEach((status, day, _) => { // eslint-disable-line @typescript-eslint/no-unused-vars
            status.activeIncidents.forEach(incident => {
              if (!processedIncidents.includes(incident.id)) {
                // Get the number of days between start and end date of the incident.
                // If it is more than 1, add the incident to all following days
                // until we have exhausted the number of days of difference.
                const startDate = dayjs(incident.beganAt.format("YYYY-MM-DD"));
                const endDate = dayjs(incident.endedAt?.format("YYYY-MM-DD") ?? currentDate);
                const diff = endDate.diff(startDate, "days");
                console.log(`difference in days: ${diff}`);
                for (let i = 1; i <= diff; i++) {
                  const updateDate = startDate.add(i, "days");
                  component.dailyData.get(updateDate.format("YYYY-MM-DD"))?.addIncident(incident);
                }
                processedIncidents.push(incident.id);
              }
            })
          });
          // Update the availability at the very end
          component.calculateAvailability();
        })
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
}
