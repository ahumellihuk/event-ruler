import { ACTask } from "./ACTask";
import { ArrayMembership } from "./ArrayMembership";
import { GenericMachine } from "./GenericMachine";
import { NameState } from "./NameState";
import { Patterns } from "./Patterns";
import { SubRuleContext } from "./SubRuleContext";

export class ACFinder {
    private static readonly ABSENCE_PATTERN = Patterns.absencePatterns();

    private constructor() {}

    static matchRules(event: Event, machine: GenericMachine<any>, subRuleContextGenerator: SubRuleContext.Generator): Object[] {
        return this.find(new ACTask(event, machine), subRuleContextGenerator);
    }

    private static find(task: ACTask, subRuleContextGenerator: SubRuleContext.Generator): Object[] {
        const startState = task.startState();
        if (!startState) {
            return [];
        }
        this.moveFrom(null, startState, 0, task, new ArrayMembership(), subRuleContextGenerator);

        while (task.stepsRemain()) {
            this.tryStep(task, subRuleContextGenerator);
        }

        return task.getMatchedRules();
    }

    private static tryStep(task: ACTask, subRuleContextGenerator: SubRuleContext.Generator): void {
        const step = task.nextStep();
        const field = task.event.fields[step.fieldIndex];

        const newMembership = ArrayMembership.checkArrayConsistency(step.membershipSoFar, field.arrayMembership);
        if (newMembership) {
            const valueMatcher = step.nameState.getTransitionOn(field.name);
            if (valueMatcher) {
                const nextFieldIndex = step.fieldIndex + 1;
                for (const nextNameStateWithPattern of valueMatcher.transitionOn(field.val)) {
                    task.collectRules(step.candidateSubRuleIds, nextNameStateWithPattern.getNameState(),
                        nextNameStateWithPattern.getPattern(), subRuleContextGenerator);

                    this.moveFromWithPriorCandidates(step.candidateSubRuleIds, nextNameStateWithPattern.getNameState(),
                        nextNameStateWithPattern.getPattern(), nextFieldIndex, task, newMembership,
                        subRuleContextGenerator);
                }
            }
        }
    }

    private static tryMustNotExistMatch(candidateSubRuleIds: Set<SubRuleContext>, nameState: NameState,
                                        task: ACTask, nextKeyIndex: number, arrayMembership: ArrayMembership,
                                        subRuleContextGenerator: SubRuleContext.Generator): void {
        if (!nameState.hasKeyTransitions()) {
            return;
        }

        for (const nextNameState of nameState.getNameTransitions(task.event, arrayMembership)) {
            if (nextNameState) {
                this.addNameState(candidateSubRuleIds, nextNameState, this.ABSENCE_PATTERN, task, nextKeyIndex, arrayMembership,
                    subRuleContextGenerator);
            }
        }
    }

    private static moveFrom(candidateSubRuleIdsForNextStep: Set<SubRuleContext> | null, nameState: NameState,
                            fieldIndex: number, task: ACTask, arrayMembership: ArrayMembership,
                            subRuleContextGenerator: SubRuleContext.Generator): void {
        this.tryMustNotExistMatch(candidateSubRuleIdsForNextStep, nameState, task, fieldIndex, arrayMembership,
            subRuleContextGenerator);

        while (fieldIndex < task.fieldCount) {
            task.addStep(fieldIndex++, nameState, candidateSubRuleIdsForNextStep, arrayMembership);
        }
    }

    private static moveFromWithPriorCandidates(candidateSubRuleIds: Set<SubRuleContext>, fromState: NameState,
                                               fromPattern: Patterns, fieldIndex: number, task: ACTask,
                                               arrayMembership: ArrayMembership,
                                               subRuleContextGenerator: SubRuleContext.Generator): void {
        const candidateSubRuleIdsForNextStep = this.calculateCandidateSubRuleIdsForNextStep(candidateSubRuleIds,
            fromState, fromPattern);

        if (candidateSubRuleIdsForNextStep && candidateSubRuleIdsForNextStep.size > 0) {
            this.moveFrom(candidateSubRuleIdsForNextStep, fromState, fieldIndex, task, arrayMembership,
                subRuleContextGenerator);
        }
    }

    private static calculateCandidateSubRuleIdsForNextStep(currentCandidateSubRuleIds: Set<SubRuleContext> | null,
                                                           fromState: NameState, fromPattern: Patterns): Set<SubRuleContext> | null {
        const subRuleIds = fromState.getNonTerminalSubRuleIdsForPattern(fromPattern);

        if (!subRuleIds) {
            return null;
        }

        if (!currentCandidateSubRuleIds || currentCandidateSubRuleIds.size === 0) {
            return subRuleIds;
        }

        const candidateSubRuleIdsForNextStep = new Set<SubRuleContext>();
        intersection(subRuleIds, currentCandidateSubRuleIds, candidateSubRuleIdsForNextStep);
        return candidateSubRuleIdsForNextStep;
    }

    private static addNameState(candidateSubRuleIds: Set<SubRuleContext>, nameState: NameState, pattern: Patterns,
                                task: ACTask, nextKeyIndex: number, arrayMembership: ArrayMembership,
                                subRuleContextGenerator: SubRuleContext.Generator): void {
        task.collectRules(candidateSubRuleIds, nameState, pattern, subRuleContextGenerator);

        this.moveFromWithPriorCandidates(candidateSubRuleIds, nameState, pattern, nextKeyIndex, task, arrayMembership,
            subRuleContextGenerator);
    }
} 