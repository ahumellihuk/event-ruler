import { GenericMachineConfiguration } from "./GenericMachineConfiguration";
import { Builder } from "./Machine";
import { MachineComplexityEvaluator } from "./MachineComplexityEvaluator";
import { NameState } from "./NameState";
import { SubRuleContext } from "./SubRuleContext";

/**
 * Represents a state machine used to match name/value patterns to rules.
 * The machine is thread safe. The concurrency strategy is:
 * Multi-thread access assumed, single-thread update enforced by synchronized on
 * addRule/deleteRule.
 * ConcurrentHashMap and ConcurrentSkipListSet are used so that writer and readers can be in tables
 * simultaneously. So all changes the writer made could be synced to and viable by all readers (in other threads).
 * Though it may generate a half-built rule to rulesForEvent() e.g. when a long rule is adding and
 * in the middle of adding, some event is coming to query machine, it won't generate side impact with rulesForEvent
 * because each step of routing will check next State and transition map before moving forward.
 *
 * T is a type representing a Rule name, it should be an immutable class.
 */
export class GenericMachine<T> {
    private static readonly MAXIMUM_RULE_SIZE = 256;
    private readonly configuration: GenericMachineConfiguration;
    private readonly startState = new NameState();
    private readonly fieldStepsUsedRefCount = new Map<string, number>();
    private readonly subRuleContextGenerator = new SubRuleContext.Generator();

    constructor(configuration?: GenericMachineConfiguration) {
        this.configuration = configuration || new GenericMachineConfiguration(false);
    }

    rulesForJSONEvent(jsonEvent: string): T[] {
        const parsedJson = JSON.parse(jsonEvent);
        return this.rulesForEvent(parsedJson);
    }

    rulesForEvent(event: any): T[] {
        // Implement the logic to retrieve rules for an event using native JSON
        return []; // Placeholder
    }

    addRule(name: T, namevals: Map<string, string[]>): void {
        // Implement the logic to add a rule
    }

    deleteRule(name: T, namevals: Map<string, string[]>): void {
        // Implement the logic to delete a rule
    }

    isEmpty(): boolean {
        // Implement the logic to check if the machine is empty
        return true; // Placeholder
    }

    evaluateComplexity(evaluator: MachineComplexityEvaluator): number {
        // Implement the logic to evaluate complexity
        return 0; // Placeholder
    }

    approximateObjectCount(maxObjectCount: number): number {
        // Implement the logic to approximate object count
        return 0; // Placeholder
    }

    static builder<T>(): Builder<GenericMachine<T>, T> {
        return new Builder<GenericMachine<T>, T>();
    }

    static class Builder<M extends GenericMachine<T>, T> {
        private additionalNameStateReuse = false;

        withAdditionalNameStateReuse(additionalNameStateReuse: boolean): Builder<M, T> {
            this.additionalNameStateReuse = additionalNameStateReuse;
            return this;
        }

        build(): M {
            const config = this.buildConfig();
            return new GenericMachine<T>(config) as M;
        }

        protected buildConfig(): GenericMachineConfiguration {
            return new GenericMachineConfiguration(this.additionalNameStateReuse);
        }
    }
} 