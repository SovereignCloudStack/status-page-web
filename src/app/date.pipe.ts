import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs';

@Pipe({
  name: 'date',
  standalone: true
})
export class DatePipe implements PipeTransform {

  transform(date: string | null | undefined, input_format: string, output_format: string): string {
    if (!date) {
      return ""
    }

    return dayjs(date, input_format).format(output_format)
  }

}
