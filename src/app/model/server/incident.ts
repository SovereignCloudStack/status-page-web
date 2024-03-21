import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import dayjs, { Dayjs } from "dayjs";
import { SGenerationalOrder } from "./generational-order";
import { SImpact } from "./impact";

export interface SIncident {
    id: string;
    displayName: string;
    description: string;
    // TODO Can this be null/undefined?
    beganAt: Dayjs;
    endedAt: Dayjs | null;
    affects: SImpact[];
    phase: SGenerationalOrder;
    updates: number[];
}

export function loadIncidents(http: HttpClient, start: Dayjs, end: Dayjs): Observable<SIncident[]> {
    return http.get<StatusApiResponse<SIncident[]>>("assets/testdata/incidents.json").pipe(
        map(response => {
            response.data.forEach(incident => {
                incident.beganAt = dayjs(incident.beganAt);
                if (incident.endedAt !== undefined && incident.endedAt !== null) {
                    incident.endedAt = dayjs(incident.endedAt);
                } else {
                    incident.endedAt = null;
                }
            });
            return response.data;
        })
    );
}
