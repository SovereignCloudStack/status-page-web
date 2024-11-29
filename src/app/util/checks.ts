import dayjs from "dayjs";
import { Impact, Incident, IncidentUpdate } from "../../external/lib/status-page-api/angular-client";
import { Result, ResultId } from "./result";

const ID_INCIDENT_NAME: ResultId = "Display Name";
const ID_INCIDENT_DESCR: ResultId = "Description";
const ID_INCIDENT_BEGAN: ResultId = "Began At";
const ID_INCIDENT_ENDED: ResultId = "Ended At";
const ID_INCIDENT_AFFECTS: ResultId = "Affects";

const ID_IMPACT_REFERENCE: ResultId = "Reference";
const ID_IMPACT_TYPE: ResultId = "Impact Type";

const ID_UPDATE_NAME: ResultId = "Display Name";
const ID_UPDATE_DESCR: ResultId = "Description";
const ID_UPDATE_CREATED_AT: ResultId = "Created At";

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
    if (incident.endedAt && incident.endedAt !== "") {
        if (incident.endedAt === "Invalid Date") {
            return new Result(ID_INCIDENT_ENDED, "The end date is invalid. Are you missing the time?");
        }
        const begin = dayjs(incident.beganAt).utc();
        const end = dayjs(incident.endedAt).utc();
        if (begin.isAfter(end)) {
            return new Result(ID_INCIDENT_ENDED, "The start date must be before the end date.");
        }
    } 
    return new Result(ID_INCIDENT_ENDED);
}

export function incidentAffects(incident: Incident): Result {
    if (!incident.affects || incident.affects.length === 0) {
        return new Result(ID_INCIDENT_AFFECTS, "An incident must affect atleast one component.");
    }
    return new Result(ID_INCIDENT_AFFECTS);
}

export function impactReference(impact: Impact, existing: Impact[]): Result {
    if (!impact.reference) {
        return new Result(ID_IMPACT_REFERENCE, "An impact needs to reference a component.");
    }
    for (let i of existing) {
        if (i.reference === impact.reference) {
            return new Result(ID_IMPACT_REFERENCE, "This component is already affected by this incident.");
        }
    }
    return new Result(ID_IMPACT_REFERENCE);
}

export function impactType(impact: Impact): Result {
    if (!impact.type) {
        return new Result(ID_IMPACT_TYPE, "An impact needs to have an impact type selected.");
    }
    return new Result(ID_IMPACT_TYPE)
}

export function updateDisplayName(update: IncidentUpdate): Result {
    if (!update.displayName) {
        return new Result(ID_UPDATE_NAME, "An incident update needs a title.");
    }
    return new Result(ID_UPDATE_NAME);
}