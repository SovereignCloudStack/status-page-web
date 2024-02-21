import { HttpClient } from "@angular/common/http";
import dayjs, { Dayjs } from "dayjs";
import { EMPTY, Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";

export interface SIncidentUpdate {
    order: number;
    displayName: string;
    description: string;
    createdAt: Dayjs;
}

export function loadIncidentUpdates(id: string, http: HttpClient): Observable<SIncidentUpdate[]> {
    try {
        return http.get<StatusApiResponse<SIncidentUpdate[]>>(`assets/testdata/updates/updates-${id}.json`).pipe(
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