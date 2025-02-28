/**
 * A custom error that indicates an error parsing a rule's value.
 */
export class ParseException extends Error {

    constructor(msg: string) {
        super(msg);
        this.name = 'ParseException';
    }

} 