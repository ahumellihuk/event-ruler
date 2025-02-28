import { MatchType } from "../MatchType";
import { InputCharacter } from "./InputCharacter";

export interface MatchTypeParser {

    /**
     * @param type Match type
     * @param value string value to parse
     * @return processed and parsed Input Character
     */
    parse(type: MatchType, value: string): InputCharacter[];
} 