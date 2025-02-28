import { InputCharacter } from "./InputCharacter";
import { InputCharacterType } from "./InputCharacterType";

/**
 * An InputCharacter that represents a wildcard.
 */
export class InputWildcard extends InputCharacter {

    constructor() {
        super();
    }

    getType(): InputCharacterType {
        return InputCharacterType.WILDCARD;
    }

    equals(o: any): boolean {
        return o != null && o.constructor === this.constructor;
    }

    hashCode(): number {
        return InputWildcard.name.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
    }

    toString(): string {
        return "Wildcard";
    }
} 