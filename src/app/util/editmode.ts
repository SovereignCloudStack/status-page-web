import { BehaviorSubject, map, Observable } from "rxjs";

export class EditMode {

    public readonly LABEL_SAVE: string = "save";

    private _editing: BehaviorSubject<boolean>;

    private _enterEditFunction?: (() => void);
    private _leaveEditFunction?: ((label?: string) => void);

    constructor() {
        this._editing = new BehaviorSubject(false);
    }

    get view(): boolean {
        return !this._editing.getValue();
    }

    get editing(): boolean {
        return this._editing.getValue();
    }

    switchMode(btn?: string) {
        if (this.view) {
            if (this._enterEditFunction) {
                this._enterEditFunction();
            }
        } else {
            if (this._leaveEditFunction) {
                this._leaveEditFunction(btn);
            }
        }
        this._editing.next(!this._editing.getValue());
    }

    public get inViewMode(): Observable<boolean> {
        return this._editing.asObservable().pipe(map((value) => !value));
    }

    public get inEditingMode(): Observable<boolean> {
        return this._editing.asObservable();
    }

    public get enterEditFunction(): (() => void) | undefined {
        return this._enterEditFunction;
    }

    public set enterEditFunction(value: (() => void) | undefined) {
        this._enterEditFunction = value;
    }

    public get leaveEditFunction(): ((label?: string) => void) | undefined {
        return this._leaveEditFunction;
    }
    public set leaveEditFunction(value: ((label?: string) => void) | undefined) {
        this._leaveEditFunction = value;
    }
}