import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
  standalone: true
})
export class ReversePipe implements PipeTransform {

  transform<T>(value: T[]): T[] {
    // We use slice to create a copy of the array before reversing it.
    // Otherwise, the original array would be reversed every time we
    // use this pipe, e.g. when accessing the incident detail page.
    return value.slice().reverse();
  }

}
