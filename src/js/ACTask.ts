import { ACStep } from "./ACStep";
import { ArrayMembership } from "./ArrayMembership";
import { GenericMachine } from "./GenericMachine";
import { NameState } from "./NameState";
import { Patterns } from "./Patterns";
import { SubRuleContext } from "./SubRuleContext";

export class ACTask {
    public readonly event: Event;
    readonly fieldCount: number;
    private readonly matchingRules: Set<Object> = new Set<Object>();
    private readonly stepQueue: Queue<ACStep> = new ArrayDeque<ACStep>();
    private readonly machine: GenericMachine<any>;

    constructor(event: Event, machine: GenericMachine<any>) {
        this.event = event;
        this.machine = machine;
        this.fieldCount = event.fields.length;
    }

    startState(): NameState {
        return this.machine.getStartState();
    }

    nextStep(): ACStep {
        return this.stepQueue.remove();
    }

    addStep(fieldIndex: number, nameState: NameState, candidateSubRuleIds: Set<SubRuleContext>, membershipSoFar: ArrayMembership): void {
        this.stepQueue.add(new ACStep(fieldIndex, nameState, candidateSubRuleIds, membershipSoFar));
    }

    stepsRemain(): boolean {
        return !this.stepQueue.isEmpty();
    }

    getMatchedRules(): Object[] {
        return Array.from(this.matchingRules);
    }

    collectRules(candidateSubRuleIds: Set<SubRuleContext>, nameState: NameState, pattern: Patterns, subRuleContextGenerator: SubRuleContext.Generator): void {
        const terminalSubRuleIds = nameState.getTerminalSubRuleIdsForPattern(pattern);
        if (!terminalSubRuleIds) {
            return;
        }

        if (!candidateSubRuleIds || candidateSubRuleIds.size === 0) {
            for (const terminalSubRuleId of terminalSubRuleIds) {
                this.matchingRules.add(terminalSubRuleId.getRuleName());
            }
        } else {
            intersection(candidateSubRuleIds, terminalSubRuleIds, this.matchingRules, SubRuleContext.getRuleName);
        }
    }
} 