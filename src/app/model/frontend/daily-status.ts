import dayjs, { Dayjs } from "dayjs";
import { FIncident } from "./incident";

export class DailyStatus {

    day: string = "-1";
    activeIncidents: FIncident[] = [];

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
    }

    get overallSeverity(): number {
        return this._severity;
    }
}