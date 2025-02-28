import { NameMatcher } from "./NameMatcher";
import { NameState } from "./NameState";
import { Patterns } from "./Patterns";

export class SingleStateNameMatcher implements NameMatcher<NameState> {
    private nameState: NameState | null = null;

    isEmpty(): boolean {
        return this.nameState === null;
    }

    addPattern(pattern: Patterns, nameState: NameState): NameState {
        if (this.nameState === null) {
            this.nameState = nameState;
        }
        return this.nameState;
    }

    deletePattern(pattern: Patterns): void {
        this.nameState = null;
    }

    findPattern(pattern: Patterns): NameState | null {
        return this.nameState;
    }

    getNextState(): NameState | null {
        return this.nameState;
    }
} 