import { HttpClient } from "@angular/common/http"
import { Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import { SIncident } from "./incident";

export class SComponent {
    id: string = "";
    displayName: string = "";
    activelyAffectedBy: SImpactComponent[] = [];
    labels: Map<string, string> = new Map();
    dailyData: Map<string, SIncident> = new Map();

    constructor(o: any) {
        this.id = o.id;
        this.displayName = o.displayName;
        this.activelyAffectedBy = o.activelyAffectedBy;
        this.labels = new Map(Object.entries(o.labels));
    }

    componentStatus(): string {
        if (this.activelyAffectedBy.length === 0) {
            return "fine";
        }
        return "unknown";
    }

    componentStatusText(): string {
        if (this.activelyAffectedBy.length === 0) {
            return "operational";
        }
        return "unknown";
    }
}

export interface SImpactComponent {
    reference: string;
    type: string;
}

export function loadComponents(http: HttpClient, incidentMap: Map<string, SIncident>): Observable<SComponent[]> {
    return http.get<StatusApiResponse<SComponent[]>>("assets/testdata/component.json").pipe(
        map(response => {
            let newArr: SComponent[] = [];
            response.data.forEach(
                v => {
                    let component = new SComponent(v);
                    // TODO Create daily data
                    newArr.push(component);
                }
            );
            return newArr;
        })
    );
}
