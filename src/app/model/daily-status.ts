import dayjs, { Dayjs } from "dayjs";
import { Impact, Incident } from "../../external/lib/status-page-api/angular-client";
import { IncidentId, SHORT_DAY_FORMAT, ShortDayString } from "./base";

export class DailyStatus {

    day: ShortDayString = "-1";
    activeIncidents: [IncidentId, Incident][] = [];
    private _topLevelIncident?: [IncidentId, Incident] = undefined;
    private _topLevelImpact?: Impact = undefined;

    private _severity: number = 0;

    constructor(day: ShortDayString | Dayjs) {
        if (day instanceof dayjs) {
            this.day = day.format(SHORT_DAY_FORMAT);
        } else {
            this.day = <ShortDayString> day;
        }
    }

    addIncident(incidentId: IncidentId, incident: Incident, impact: Impact) {
        this.activeIncidents.push([incidentId, incident]);
        this._severity = Math.max(this._severity, impact.severity ?? 0);
        if (this._topLevelIncident) {
            if ((this._topLevelImpact?.severity ?? 0) < (impact.severity ?? 0)) {
                this._topLevelIncident = [incidentId, incident];
                this._topLevelImpact = impact;
            }
        } else {
            this._topLevelIncident = [incidentId, incident];
            this._topLevelImpact = impact;
        }
    }

    get overallSeverity(): number {
        return this._severity;
    }

    get topLevelIncident(): [IncidentId, Incident] | undefined {
        return this._topLevelIncident;
    }
}