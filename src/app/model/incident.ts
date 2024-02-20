import { HttpClient } from "@angular/common/http";
import { EMPTY, Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import { Dayjs } from "dayjs";
import { SImpactReference } from "./impact";

export interface SIncident {
    id: string;
    displayName: string;
    description: string;
    // TODO Can this be null/undefined?
    beganAt: string;
    endetAt: string | null;
    affects: SImpactReference[];
    phase: SPhaseReference;
    updates: SIncidentUpdate[]
}

export interface SPhaseReference {
    generation: number;
    order: number;
}

export interface SIncidentUpdate {
    order: number;
    displayName: string;
    description: string;
    createdAt: string;
}

export function loadIncidents(http: HttpClient, start: Dayjs, end: Dayjs): Observable<SIncident[]> {
    return http.get<StatusApiResponse<SIncident[]>>("assets/testdata/incident.json").pipe(
        map(response => {
            return response.data;
        })
    );
}

export function loadIncidentUpdates(id: string, http: HttpClient): Observable<SIncidentUpdate[]> {
    try {
        return http.get<StatusApiResponse<SIncidentUpdate[]>>(`assets/testdata/updates/updates-${id}.json`).pipe(
            map(response => {
                return response.data;
            }),
        );
    } catch (e: any) {
        console.log(`Error loading incident updates: ${e}`);
    }
    return EMPTY;
}