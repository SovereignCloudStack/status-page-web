import { HttpClient } from "@angular/common/http";
import { StatusApiResponse } from "./response";
import { Observable, map } from "rxjs";

export interface SPhaseGeneration {
    generation: number;
    phases: string[];
}

export function loadPhases(http: HttpClient): Observable<SPhaseGeneration> {
    // TODO This only gives us the phases of the current generation. What to do if we have multiple?
    // Maybe this should be changed in the API server itself.
    return http.get<StatusApiResponse<SPhaseGeneration>>(`assets/testdata/phases.json`).pipe(
        map(response => {
            return response.data;
        }),
    );
}
