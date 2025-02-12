import { NameState } from "./NameState";
import { SubRuleContext } from "./SubRuleContext";

export class Step {
    readonly keyIndex: number;
    readonly nameState: NameState;
    readonly candidateSubRuleIds: Set<SubRuleContext>;

    constructor(keyIndex: number, nameState: NameState, candidateSubRuleIds: Set<SubRuleContext>) {
        this.keyIndex = keyIndex;
        this.nameState = nameState;
        this.candidateSubRuleIds = candidateSubRuleIds;
    }

    equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o == null || o.constructor !== this.constructor) {
            return false;
        }
        const step = o as Step;
        return this.keyIndex === step.keyIndex &&
               this.nameState === step.nameState &&
               this.candidateSubRuleIds === step.candidateSubRuleIds;
    }

    hashCode(): number {
        return this.keyIndex ^ this.nameState.hashCode() ^ this.candidateSubRuleIds.size;
    }
} 