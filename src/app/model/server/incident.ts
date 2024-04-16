import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import dayjs, { Dayjs } from "dayjs";
import { SGenerationalOrder } from "./generational-order";
import { SImpact } from "./impact";
import { AppConfigService } from "../../app-config.service";

export interface SIncident {
    id: string;
    displayName: string;
    description: string;
    // TODO This is currently marked as nullable in the OpenAPI
    // spec of the status API server. Is that sensible? Could we
    // change it so it is a required field?
    beganAt: Dayjs;
    endedAt: Dayjs | null;
    affects: SImpact[];
    phase: SGenerationalOrder;
    updates: number[];
}

export function loadIncidents(http: HttpClient, config: AppConfigService, start: Dayjs, end: Dayjs): Observable<SIncident[]> {
    return http.get<StatusApiResponse<SIncident[]>>(config.incidentsUrl(start, end)).pipe(
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
