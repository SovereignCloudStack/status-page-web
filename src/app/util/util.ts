import dayjs, { Dayjs } from "dayjs";

const DT_FORMAT = "YYYY-MM-DDTHH:mm";

export function dayjsToUi(dt: Dayjs): string {
    return dt.format(DT_FORMAT);
}

export function uiToDayjs(dt: string): Dayjs {
    return dayjs(dt);
}