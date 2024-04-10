import { HttpClient } from "@angular/common/http";
import dayjs, { Dayjs } from "dayjs";
import { EMPTY, Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import { AppConfigService } from "../../app-config.service";

export interface SIncidentUpdate {
    order: number;
    displayName: string;
    description: string;
    createdAt: Dayjs;
}

export function loadIncidentUpdates(config: AppConfigService, id: string, http: HttpClient): Observable<SIncidentUpdate[]> {
    try {
        return http.get<StatusApiResponse<SIncidentUpdate[]>>(config.incidentUpdateUrl(id)).pipe(
            map(response => {
                response.data.forEach(update => {
                    update.createdAt = dayjs(update.createdAt);
                });
                return response.data;
            }),
        );
    } catch (e: any) {
        console.log(`Error loading incident updates: ${e}`);
    }
    return EMPTY;
}