import { ByteState } from "./ByteState";
import { MatchType } from "./MatchType";

/**
 * Evaluates the complexity of machines.
 */
export class MachineComplexityEvaluator {

    private static readonly MATCH_TYPES_WITH_COMPLEXITY = new Set<MatchType>([
        MatchType.WILDCARD, MatchType.ANYTHING_BUT_WILDCARD
    ]);

    /**
     * Cap evaluation of complexity at this threshold.
     */
    private readonly maxComplexity: number;

    constructor(maxComplexity: number) {
        this.maxComplexity = maxComplexity;
    }

    getMaxComplexity(): number {
        return this.maxComplexity;
    }

    /**
     * Returns the maximum possible number of wildcard rule prefixes that could match a theoretical input value for a
     * machine beginning with ByteState state. This value is equivalent to the maximum number of states a traversal
     * could be present in simultaneously, counting only states that can lead to a wildcard match pattern. This function
     * will recursively evaluate all other machines accessible via next NameStates, and will return the maximum observed
     * from any machine. Caps out evaluation at maxComplexity to keep runtime under control. Otherwise, runtime for this
     * machine would be O(MN^2), where N is the number of states accessible from ByteState state, and M is the total
     * number of ByteMachines accessible via next NameStates.
     *
     * @param state Evaluates a machine beginning at this state.
     * @return The lesser of maxComplexity and the maximum possible number of wildcard rule prefixes from any machines.
     */
    evaluate(state: ByteState): number {
        // Implement the logic for evaluating machine complexity
        return 0; // Placeholder
    }

    // Additional methods and logic to be implemented
} 