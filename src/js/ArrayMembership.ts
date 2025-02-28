import { IntIntMap } from "./IntIntMap";

export class ArrayMembership {
    private static readonly EMPTY = new IntIntMap();

    private readonly membership: IntIntMap;

    constructor(membership?: ArrayMembership) {
        if (membership && membership.size() !== 0) {
            this.membership = membership.membership.clone();
        } else {
            this.membership = new IntIntMap();
        }
    }

    putMembership(array: number, index: number): void {
        if (index === IntIntMap.NO_VALUE) {
            this.membership.remove(array);
        } else {
            this.membership.put(array, index);
        }
    }

    deleteMembership(array: number): void {
        this.membership.remove(array);
    }

    getMembership(array: number): number {
        return this.membership.get(array);
    }

    isEmpty(): boolean {
        return this.membership.isEmpty();
    }

    private size(): number {
        return this.membership.size();
    }

    toString(): string {
        let sb = '';
        for (const entry of this.membership.entries()) {
            sb += `${entry.getKey()}[${entry.getValue()}] `;
        }
        return sb;
    }

    static checkArrayConsistency(membershipSoFar: ArrayMembership, fieldMembership: ArrayMembership): ArrayMembership | null {
        if (membershipSoFar.isEmpty()) {
            return fieldMembership.isEmpty() ? membershipSoFar : new ArrayMembership(fieldMembership);
        }

        let newMembership: ArrayMembership | null = null;
        for (const arrayEntry of fieldMembership.membership.entries()) {
            const array = arrayEntry.getKey();
            const indexInThisArrayOfThisField = arrayEntry.getValue();
            const indexInThisArrayPreviouslyAppearingInMatch = membershipSoFar.getMembership(array);

            if (indexInThisArrayPreviouslyAppearingInMatch === IntIntMap.NO_VALUE) {
                if (newMembership === null) {
                    newMembership = new ArrayMembership(membershipSoFar);
                }
                newMembership.putMembership(array, indexInThisArrayOfThisField);
            } else if (indexInThisArrayOfThisField !== indexInThisArrayPreviouslyAppearingInMatch) {
                return null;
            }
        }

        return newMembership === null ? membershipSoFar : newMembership;
    }
} 