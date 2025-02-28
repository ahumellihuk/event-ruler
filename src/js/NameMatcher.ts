import { NameState } from "./NameState";
import { Patterns } from "./Patterns";


export interface NameMatcher<R> {
    isEmpty(): boolean;

    addPattern(pattern: Patterns, nameState: NameState): R;

    deletePattern(pattern: Patterns): void;

    findPattern(pattern: Patterns): R | null;

    getNextState(): R;
} 