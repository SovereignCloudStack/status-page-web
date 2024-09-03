import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { BehaviorSubject, Observable, combineLatestWith } from 'rxjs';
import { DailyStatus } from './model/daily-status';
import { Component, ComponentService, IdField, ImpactService, ImpactType, Incident, IncidentResponseData, IncidentService, IncidentUpdate, IncidentUpdateResponseData, PhaseList, PhaseService, Severity } from '../external/lib/status-page-api/angular-client';
import { ComponentId, formatQueryDate, ImpactId, IncidentId, SHORT_DAY_FORMAT, ShortDayString } from './model/base';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  currentDay!: ShortDayString;

  phaseGenerations!: PhaseList;
  severities!: Severity[];
  impactTypes!: Map<ImpactId, ImpactType>;

  components!: Map<ComponentId, Component>;
  componentAvailability!: Map<ComponentId, number>;
  componentStatusByDay!: Map<ComponentId, Map<ShortDayString, DailyStatus>>;

  incidents!: Map<IncidentId, Incident>;
  incidentsByDay!: Map<ShortDayString, [IncidentId, Incident][]>;
  ongoingIncidents!: Map<ShortDayString, [IncidentId, Incident][]>;
  completedIncidents!: Map<ShortDayString, [IncidentId, Incident][]>;

  maintenanceEvents!: IncidentResponseData[];

  incidentUpdates!: Map<IncidentId, IncidentUpdateResponseData[]>;

  private _loadingFinished!: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private config: AppConfigService,
    private comps: ComponentService,
    private incs: IncidentService,
    private phas: PhaseService,
    private imps: ImpactService,
  ) {
    this.currentDay = dayjs().format(SHORT_DAY_FORMAT);

    this._loadingFinished = new BehaviorSubject(false);

    this.prepareLoading();
    this.loadData();
  }

  private prepareLoading() {
    this.phaseGenerations = { phases: [] };
    this.severities = [];
    this.impactTypes = new Map();

    this.components = new Map();
    this.componentAvailability = new Map();
    this.componentStatusByDay = new Map();

    this.incidents = new Map();
    this.incidentsByDay = new Map();
    this.ongoingIncidents = new Map();
    this.completedIncidents = new Map();

    this.maintenanceEvents = [];

    this.incidentUpdates = new Map();
  }

  get loadingFinished(): Observable<boolean> {
    return this._loadingFinished.asObservable();
  }

  impactTypeName(type: string): string {
    return this.impactTypes.get(type)?.displayName ?? "unknown";
  }

  createIncident(incident: Incident): Observable<IdField> {
    return this.incs.createIncident(incident);
  }

  updateIncident(id: IncidentId, incident: Incident): Observable<void> {
    return this.incs.updateIncident(id, incident);
  }

  private addToMapList<T>(
    map: Map<string, T[]>,
    value: T,
    key: string
  ): void {
    const list = map.get(key) ?? [];
    list.push(value);
    map.set(key, list);
  }

  reload(): void {
    // Remove any authorization content from the IncidentService's
    // headers, as this can cause a 401 - Unauthorized error on
    // GET requests.
    // The authorization header will be reestablished by the management
    // component's subscription to checkAuth().
    this.incs.defaultHeaders = this.incs.defaultHeaders.delete("Authorization");
    // Set load state to false to signal that our data cannot be used right now
    this._loadingFinished.next(false);
    // Clean up present state
    this.prepareLoading();
    // Load data - this will set load state back to true once done
    this.loadData();
  }

  private loadData(): void {
    // Start requests for most data types from API server
    const phases$ = this.phas.getPhaseList();
    const severities$ = this.imps.getSeverities();
    const impactTypes$ = this.imps.getImpactTypes();
    const components$ = this.comps.getComponents();

    // Build map of days and the incidents happening on them
    const currentDate = dayjs();
    const startDate = currentDate.subtract(this.config.noOfDays, "days");
    const dateRange: string[] = [];
    this.incidentsByDay.set(this.currentDay, []);
    dateRange[this.config.noOfDays - 1] = this.currentDay;
    for (let i = 1; i < this.config.noOfDays; i++) {
      const dateStr = currentDate.subtract(i, "days").format(SHORT_DAY_FORMAT);
      dateRange[this.config.noOfDays - 1 - i] = dateStr;
      this.incidentsByDay.set(dateStr, []);
    }

    // Start incidents query
    const incidents$ = this.incs.getIncidents(
      formatQueryDate(startDate),
      formatQueryDate(currentDate)
    );

    // Query maintenance events to complete our data loading
    const future = currentDate.add(this.config.maintenancePreviewDays, "d");
    const maintenance$ = this.incs.getIncidents(
      formatQueryDate(currentDate),
      formatQueryDate(future)
    );

    // Set up result handling
    phases$.pipe(
      combineLatestWith(severities$, impactTypes$, components$, incidents$, maintenance$)
    ).subscribe(([phases, severities, impacts, components, incidents, maintenanceEvents]) => {
      this.phaseGenerations = phases.data;
      this.severities = severities.data;
      impacts.data.forEach(impact => {
        this.impactTypes.set(impact.id, impact);
      });
      components.data.forEach((comp) => {
        this.components.set(comp.id, comp);
        this.componentAvailability.set(comp.id, -1);
      });
      incidents.data.forEach(incident => {
        this.incidents.set(incident.id, incident);
        // Use string.split to remove the time component, as we only care
        // about the day's date.
        const incidentDate = dayjs(incident.beganAt?.split("T")[0]);
        const incidentDateStr = incidentDate.format(SHORT_DAY_FORMAT);
        // Add incident to all days it was active for. If it is still ongoing,
        // add it to all days until today.
        const finalDate = incident.endedAt ? dayjs(incident.endedAt.split("T")[0]) : currentDate;
        const incidentActiveDays = finalDate.diff(incidentDate, "days");
        for (let i = 0; i <= incidentActiveDays; i++) {
          const activeDate = incidentDate.add(i, "days").format(SHORT_DAY_FORMAT);
          this.incidentsByDay.get(activeDate)?.push([incident.id, incident]);
        }
        // Is this incident complete or is it still ongoing?
        if (incident.endedAt) {
          this.addToMapList(this.completedIncidents, [incident.id, incident], incidentDateStr);
        } else {
          this.addToMapList(this.ongoingIncidents, [incident.id, incident], incidentDateStr);
        }
        // Query the updates for this incident, too.
        const updates$ = this.incs.getIncidentUpdates(incident.id);
        updates$.subscribe(answer => {
          const list = this.incidentUpdates.get(incident.id) ?? [];
          this.incidentUpdates.set(incident.id, list.concat(answer.data));
          // TODO Mark this one as loaded? So that we can differentiate between
          // an incident that has all updates retrieved and one that simply has
          // no updates to retrieve?
        });
      });
      // Assign list of maintenance events
      this.maintenanceEvents = maintenanceEvents.data.filter((mEvent) => {
        mEvent.affects = mEvent.affects?.filter((affects) => {
          const maintenanceSeverity = this.config.severities.get('maintenance');
          const maintenanceSeverityValue = maintenanceSeverity ? maintenanceSeverity.end : 0;
  
          return affects.severity !== undefined && affects.severity <= maintenanceSeverityValue;
        });
  
        return mEvent.affects !== undefined && mEvent.affects.length > 0;
      });

      // Set up cross references
      this.components.forEach((component, componentId) => {
        // Create daily data for each component
        for (const [day, incidents] of this.incidentsByDay) {
          const dailyData = new DailyStatus(day);
          for (const incident of incidents) {
            // Check if the incident affects this component
            const affectingImpacts = incident[1].affects?.filter(c => c.reference === componentId) ?? [];
            for (const impact of affectingImpacts) {
              dailyData.addIncident(incident[0], incident[1], impact);
            }
          }
          const statusList = this.componentStatusByDay.get(componentId) ?? new Map<ShortDayString, DailyStatus>();
          statusList.set(day, dailyData);
          this.componentStatusByDay.set(componentId, statusList);
        }
        // Calculate availability of this component
        this.calculateAvailability(componentId);
      });
      // We are now fully loaded and can display the data
      this._loadingFinished.next(true);
    });
  }

  private calculateAvailability(component: ComponentId): void {
    const statusList = this.componentStatusByDay.get(component);
    if (!statusList) {
      // TODO Error properly
      console.log("Found a component with missing daily status list?");
      return;
    }
    let daysWithIncidents = 0;
    statusList.forEach(day => {
      if (day.activeIncidents.length > 0) {
        daysWithIncidents++;
      }
    });
    const availability = (statusList.size - daysWithIncidents) / statusList.size;
    this.componentAvailability.set(component, availability);
  }
}
