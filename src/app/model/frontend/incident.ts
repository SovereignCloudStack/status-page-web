import { Dayjs } from "dayjs";
import { SIncident } from "../server/incident";
import { FComponent } from "./component";
import { SIncidentUpdate } from "../server/incident-update";
import { SPhaseGeneration } from "../server/phase";

export class FIncident {

    private _affectedComponents: FComponent[];
    private _severities: Map<FComponent, number>;
    private _incidentUpdates: SIncidentUpdate[];
    private _phase: string;

    serverSide: SIncident;

    constructor(serverSide: SIncident, phases: SPhaseGeneration) {
        this.serverSide = serverSide;
        this._phase = phases.phases[this.serverSide.phase.order];
        this._affectedComponents = [];
        this._severities = new Map();
        this._incidentUpdates = [];
    }

    addAffectedComponent(component: FComponent, severity: number): void {
        this._affectedComponents.push(component);
        this._severities.set(component, severity);
    }

    addUpdate(update: SIncidentUpdate): void {
        this._incidentUpdates.push(update);
    }

    severityFor(component: FComponent): number {
        return this._severities.get(component) ?? -1;
    }

    get id(): string {
        return this.serverSide.id;
    }

    get displayName(): string {
        return this.serverSide.displayName;
    }

    get description(): string {
        return this.serverSide.description;
    }

    get beganAt(): Dayjs {
        return this.serverSide.beganAt;
    }

    get endedAt(): Dayjs | null {
        return this.serverSide.endedAt;
    }

    get ongoing(): boolean {
        return this.endedAt === null;
    }

    get phase(): string {
        return this._phase;
    }

    get updates(): SIncidentUpdate[] {
        return this._incidentUpdates;
    }

    get affectedComponents(): FComponent[] {
        return this._affectedComponents;
    }

    get severities(): Map<FComponent, number> {
        return this._severities;
    }

    get maxSeverity(): number {
        let severity = 0;
        for (const impact of this.severities.values()) {
            severity = Math.max(severity, impact);
        }
        return severity;
    }
}
