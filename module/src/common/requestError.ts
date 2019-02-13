export class RequestError<T> extends Error {

    constructor(message:string,public data?:T) {

        super(message);

        Object.setPrototypeOf(this, RequestError.prototype);

    }

}