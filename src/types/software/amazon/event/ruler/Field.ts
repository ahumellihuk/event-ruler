import { ArrayMembership } from "./ArrayMembership";


/**
 * Represents the name and value of a data field in an event that Ruler will match.
 *
 * Both name and value are represented as strings. Also provided for each field is information about its position
 * in any arrays the event may contain. This is used to guard against a rule matching a set of fields which are in
 * peer elements of an array, a situation which it turns out is perceived by users as a bug.
 */
export class Field {
    readonly name: string;
    readonly val: string;
    readonly arrayMembership: ArrayMembership;

    constructor(name: string, val: string, arrayMembership: ArrayMembership) {
        this.name = name;
        this.val = val;
        this.arrayMembership = arrayMembership;
    }
} 