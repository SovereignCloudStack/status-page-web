import dayjs, { Dayjs } from "dayjs";
import { FIncident } from "./incident";

export class DailyStatus {

    day: string = "-1";
    activeIncidents: FIncident[] = [];
    _topLevelIncident?: FIncident = undefined;

    private _severity: number = 0;

    constructor(day: string | Dayjs) {
        if (day instanceof dayjs) {
            this.day = day.format("YYYY-MM-DD");
        } else {
            this.day = <string> day;
        }
    }

    addIncident(incident: FIncident) {
        this.activeIncidents.push(incident);
        this._severity = Math.max(this._severity, incident.maxSeverity);
        if (this._topLevelIncident) {
            if (this._topLevelIncident.maxSeverity < incident.maxSeverity) {
                this._topLevelIncident = incident;
            }
        } else {
            this._topLevelIncident = incident;
        }
    }

    get overallSeverity(): number {
        return this._severity;
    }

    get topLevelIncident(): FIncident | undefined {
        return this._topLevelIncident;
    }
}