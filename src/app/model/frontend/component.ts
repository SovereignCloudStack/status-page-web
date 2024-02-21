import { SComponent } from "../server/component";
import { DailyStatus } from "./daily-status";

export class FComponent {

    dailyData: Map<string, DailyStatus> = new Map();

    serverSide: SComponent;

    constructor(serverSide: SComponent) {
        this.serverSide = serverSide;
    }

    get displayName(): string {
        return this.serverSide.displayName;
    }

    get status(): string {
        return this.serverSide.activelyAffectedBy.length > 0 ? "unknown" : "fine";
    }

    get statusText(): string {
        return this.serverSide.activelyAffectedBy.length > 0 ? "unknown" : "operational";
    }
}