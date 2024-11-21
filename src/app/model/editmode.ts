import { BehaviorSubject, map, Observable } from "rxjs";

export class EditMode {

    private _editing: BehaviorSubject<boolean>;

    constructor() {
        this._editing = new BehaviorSubject(false);
    }

    get view(): boolean {
        return !this._editing.getValue();
    }

    get editing(): boolean {
        return this._editing.getValue();
    }

    switchMode() {
        this._editing.next(!this._editing.getValue());
    }

    get inViewMode(): Observable<boolean> {
        return this._editing.asObservable().pipe(map((value) => !value));
    }

    get inEditingMode(): Observable<boolean> {
        return this._editing.asObservable();
    }
}