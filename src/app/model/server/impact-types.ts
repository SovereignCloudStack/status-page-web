import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";

export interface SImpactTypes {
    id: string;
    displayName: string;
    description: string;
}

export function loadImpactTypes(http: HttpClient): Observable<SImpactTypes[]> {
    return http.get<StatusApiResponse<SImpactTypes[]>>("/assets/testdata/impact-types.json").pipe(
        map(response => response.data)
    );
}