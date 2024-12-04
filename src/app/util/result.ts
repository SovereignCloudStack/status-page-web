
export type ResultId = string;

export class Result {

    private resultId: ResultId;
    private errorMessage?: string = undefined;

    constructor(id: ResultId, msg?: string) {
        this.resultId = id;
        if (msg !== undefined && msg !== null && msg.length > 0) {
            this.errorMessage = msg;
        }
    }

    get id(): ResultId {
        return this.resultId;
    }

    get ok(): boolean {
        return this.errorMessage === undefined;
    }

    get error(): boolean {
        return this.errorMessage !== undefined;
    }

    get message(): string {
        if (this.errorMessage === undefined) {
            throw new Error("Cannot retrieve the error message on an ok result");
        }
        return this.errorMessage;
    }
}