import { Injectable } from '@angular/core';
import { faFloppyDisk, faPenToSquare, faSquarePlus, faTrashCan, faXmarkCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class IconProviderService {

  constructor() { }

  get delete(): IconDefinition {
    return faTrashCan;
  }

  get newElement(): IconDefinition {
    return faSquarePlus;
  }

  get saveNew(): IconDefinition {
    return faFloppyDisk;
  }

  get edit(): IconDefinition {
    return faPenToSquare;
  }

  get saveChanges(): IconDefinition {
    return faFloppyDisk;
  }

  get discardChanges(): IconDefinition {
    return faXmarkCircle;
  }
}
