import { KeyValue } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'callback',
  standalone: true
})
export class CallbackPipe implements PipeTransform {

  transform<T>(items: T[], callback: (item: T) => boolean): T[] {
    if (!items || !callback) {
      return items;
    }
    return items.filter(item => callback(item));
  }

}
