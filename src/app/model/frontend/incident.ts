import { Dayjs } from "dayjs";
import { SIncident } from "../server/incident";
import { FComponent } from "./component";
import { SIncidentUpdate } from "../server/incident-update";
import { SPhaseGeneration } from "../server/phase";

export class FIncident {

    private affectedComponents: FComponent[];
    private incidentUpdates: SIncidentUpdate[];
    private _phase: string;

    serverSide: SIncident;

    constructor(serverSide: SIncident, phases: SPhaseGeneration) {
        this.serverSide = serverSide;
        console.log(`Retrieving entry #${this.serverSide.phase.order} from phase list`);
        console.log(phases.phases);
        this._phase = phases.phases[this.serverSide.phase.order];
        console.log(`Result: phase is "${this._phase}"`);
        // TODO
        this.affectedComponents = [];
        this.incidentUpdates = [];
    }

    addAffectedComponent(component: FComponent): void {
        this.affectedComponents.push(component);
    }

    addUpdate(update: SIncidentUpdate): void {
        this.incidentUpdates.push(update);
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

    get phase(): string {
        return this._phase;
    }

    get updates(): SIncidentUpdate[] {
        return this.incidentUpdates;
    }
}