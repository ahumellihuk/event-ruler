import { ArrayMembership } from "./ArrayMembership";
import { NameState } from "./NameState";
import { SubRuleContext } from "./SubRuleContext";

export class ACStep {
    readonly fieldIndex: number;
    readonly nameState: NameState;
    readonly candidateSubRuleIds: Set<SubRuleContext>;
    readonly membershipSoFar: ArrayMembership;

    constructor(fieldIndex: number, nameState: NameState, candidateSubRuleIds: Set<SubRuleContext>, arrayMembership: ArrayMembership) {
        this.fieldIndex = fieldIndex;
        this.nameState = nameState;
        this.candidateSubRuleIds = candidateSubRuleIds;
        this.membershipSoFar = arrayMembership;
    }
} 