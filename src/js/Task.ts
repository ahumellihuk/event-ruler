import { GenericMachine } from "./GenericMachine";
import { NameState } from "./NameState";
import { Patterns } from "./Patterns";
import { Step } from "./Step";
import { SubRuleContext } from "./SubRuleContext";


export class Task {
    public readonly event: string[];
    private readonly matchingRules: Set<any> = new Set();
    private readonly stepQueue: Step[] = [];
    private readonly seenSteps: Set<Step> = new Set();
    private readonly machine: GenericMachine<any>;

    constructor(event: string[], machine: GenericMachine<any>) {
        this.event = event;
        this.machine = machine;
    }

    startState(): NameState {
        return this.machine.getStartState();
    }

    isFieldUsed(field: string): boolean {
        if (field.includes('.')) {
            const steps = field.split('.');
            return steps.every(step => this.machine.isFieldStepUsed(step));
        }
        return this.machine.isFieldStepUsed(field);
    }

    nextStep(): Step {
        return this.stepQueue.shift()!;
    }

    addStep(step: Step): void {
        if (this.seenSteps.add(step)) {
            this.stepQueue.push(step);
        }
    }

    stepsRemain(): boolean {
        return this.stepQueue.length > 0;
    }

    getMatchedRules(): any[] {
        return Array.from(this.matchingRules);
    }

    collectRules(candidateSubRuleIds: Set<SubRuleContext> | null, nameState: NameState, pattern: Patterns, subRuleContextGenerator: SubRuleContext.Generator): void {
        const terminalSubRuleIds = nameState.getTerminalSubRuleIdsForPattern(pattern);
        if (!terminalSubRuleIds) {
            return;
        }

        if (!candidateSubRuleIds || candidateSubRuleIds.size === 0) {
            terminalSubRuleIds.forEach(terminalSubRuleId => {
                this.matchingRules.add(terminalSubRuleId.getRuleName());
            });
        } else {
            intersection(candidateSubRuleIds, terminalSubRuleIds, this.matchingRules, SubRuleContext.getRuleName);
        }
    }
} 