import { Dayjs } from "dayjs";

export type ComponentId = string;
export type IncidentId = string;
export type ImpactId = string;
export type DayString = string;
export type ShortDayString = string;

export type Severity = number;

export const SHORT_DAY_FORMAT: string = "YYYY-MM-DD";

export const DT_QUERY_FORMAT: string = "YYYY-MM-DDTHH[:]mm[:]ss[Z]";

 export function formatQueryDate(date: Dayjs): string {
    return date.format(DT_QUERY_FORMAT);
  }