import dayjs, { Dayjs } from "dayjs";
import { FIncident } from "./incident";

export class DailyStatus {

    day: string = "-1";
    activeIncidents: FIncident[] = [];

    private _overallStatus: string = "unknown";
    private _overallStatusText: string = "unknown";

    constructor(day: string | Dayjs) {
        if (day instanceof dayjs) {
            this.day = day.format("YYYY-MM-DD");
        } else {
            this.day = <string> day;
        }
    }

    addIncident(incident: FIncident) {
        // TODO Determine if this changes the day's overall status
        this.activeIncidents.push(incident);
    }

    get overallStatus(): string {
        return this.activeIncidents.length > 0 ? "unknown" : "fine";
    }

    get overallStatusText(): string {
        return this.activeIncidents.length > 0 ? "unknown" : "operational";
    }
}