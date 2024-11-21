import dayjs from "dayjs";
import { Incident } from "../../external/lib/status-page-api/angular-client";

export type ResultId = string;

const ID_INCIDENT_NAME: ResultId = "Display Name";
const ID_INCIDENT_DESCR: ResultId = "Description";
const ID_INCIDENT_BEGAN: ResultId = "Began At";
const ID_INCIDENT_ENDED: ResultId = "Ended At";


export class Result {

    private resultId: ResultId;
    private errorMessage?: string = undefined;

    constructor(id: ResultId, msg?: string) {
        this.resultId = id;
        if (msg !== undefined && msg !== null && msg.length > 0) {
            this.errorMessage = msg;
        }
    }

    get id(): ResultId {
        return this.resultId;
    }

    get ok(): boolean {
        return this.errorMessage === undefined;
    }

    get error(): boolean {
        return this.errorMessage !== undefined;
    }

    get message(): string {
        if (this.errorMessage === undefined) {
            throw new Error("Cannot retrieve the error message on an ok result");
        }
        return this.errorMessage;
    }
}

export function incidentName(incident: Incident): Result {
    if (incident.displayName !== undefined && incident.displayName !== null && incident.displayName.length > 0) {
        return new Result(ID_INCIDENT_NAME);
    }
    return new Result(ID_INCIDENT_NAME, "Display name must not be empty.");
}

export function incidentDescription(incident: Incident): Result {
    return new Result(ID_INCIDENT_DESCR);
}

export function incidentBeganAt(incident: Incident): Result {
    if (!incident.beganAt) {
        return new Result(ID_INCIDENT_BEGAN, "An incident must have a start date.");
    }
    // TODO More?
    return new Result(ID_INCIDENT_BEGAN);
}

export function incidentEndedAt(incident: Incident): Result {
    if (incident.endedAt) {
        const begin = dayjs(incident.beganAt).utc();
        const end = dayjs(incident.endedAt).utc();
        if (begin.isAfter(end)) {
            return new Result(ID_INCIDENT_ENDED, "The start date must be before the end date.");
        }
    } 
    return new Result(ID_INCIDENT_ENDED);
}