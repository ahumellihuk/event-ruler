import { NameState } from "./NameState";
import { Patterns } from "./Patterns";

export class NameStateWithPattern {
    private readonly nameState: NameState;
    private readonly pattern: Patterns | null;

    constructor(nameState: NameState, pattern: Patterns | null = null) {
        if (!nameState) throw new Error('nameState cannot be null');
        this.nameState = nameState;
        this.pattern = pattern;
    }

    getNameState(): NameState {
        return this.nameState;
    }

    getPattern(): Patterns | null {
        return this.pattern;
    }

    equals(o: any): boolean {
        if (!(o instanceof NameStateWithPattern)) {
            return false;
        }
        return this.nameState === o.nameState && this.pattern === o.pattern;
    }

    hashCode(): number {
        return this.nameState.hashCode() ^ (this.pattern ? this.pattern.hashCode() : 0);
    }
} 