import { HttpClient } from "@angular/common/http"
import { Observable, map } from "rxjs";
import { StatusApiResponse } from "./response";
import { STypedReference } from "./typed-reference";
import { AppConfigService } from "../../app-config.service";

export class SComponent {
    id: string = "";
    displayName: string = "";
    activelyAffectedBy: STypedReference[] = [];
    labels: Map<string, string> = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function loadComponents(http: HttpClient, config: AppConfigService): Observable<SComponent[]> {
    return http.get<StatusApiResponse<SComponent[]>>(config.componentsUrl).pipe(
        map(response => {
            const newArr: SComponent[] = [];
            response.data.forEach(
                v => {
                    const component = new SComponent(v);
                    newArr.push(component);
                }
            );
            return newArr;
        })
    );
}
