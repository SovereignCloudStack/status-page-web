import dayjs, { Dayjs } from "dayjs";
import { Incident } from "../../external/lib/status-page-api/angular-client";

const DT_FORMAT = "YYYY-MM-DDTHH:mm";
const DT_QUERY_FORMAT: string = "YYYY-MM-DDTHH[:]mm[:]ss[Z]";

export function incidentDateToUi(dt?: string | null): string {
    if (!dt) {
        return "";
    }
    return dayjsToUi(dayjs(dt).local())
}

export function dayjsToUi(dt?: Dayjs): string {
    if (!dt) {
        return "";
    }
    return dt.format(DT_FORMAT);
}

export function uiToDayjs(dt: string): Dayjs {
    return dayjs(dt);
}

export function uiToIncidentDate(dt: string): string {
    if (dt === "") {
        return dt;
    }
    return formatQueryDate(uiToDayjs(dt));
}

export function formatQueryDate(date: Dayjs): string {
  return date.format(DT_QUERY_FORMAT);
}

export function createIncident(began?: Dayjs): Incident {
    return {
        displayName: "",
        description: "",
        beganAt: formatQueryDate(began ?? dayjs().utc()),
        endedAt: null,
        phase: {
          generation: 1,
          order: 0
        },
        affects: [],
        updates: []
      };
}