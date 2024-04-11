import { SComponent } from "../server/component";
import { DailyStatus } from "./daily-status";

export class FComponent {

    dailyData: Map<string, DailyStatus> = new Map();
    private _availability: number = -1;

    serverSide: SComponent;

    constructor(serverSide: SComponent) {
        this.serverSide = serverSide;
    }

    calculateAvailability(): void {
        // Calculate the uptime value for each component
        let daysWithIncidents = 0;
        this.dailyData.forEach(day => {
          if (day.activeIncidents.length > 0) {
            daysWithIncidents++;
          }
        });
        this._availability = (this.dailyData.size - daysWithIncidents) / this.dailyData.size;
    }

    get id(): string {
        return this.serverSide.id;
    }

    get displayName(): string {
        return this.serverSide.displayName;
    }

    get availability(): number {
        if (this._availability < 0) {
            this.calculateAvailability();
        }
        return this._availability;
    }

    get currentSeverity(): number {
        return this.dailyData.values().next().value.overallSeverity;
    }

    get status(): string {
        return this.serverSide.activelyAffectedBy.length > 0 ? "unknown" : "fine";
    }

    get statusText(): string {
        return this.serverSide.activelyAffectedBy.length > 0 ? "unknown" : "operational";
    }
}