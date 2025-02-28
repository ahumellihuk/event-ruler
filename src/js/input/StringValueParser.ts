import { InputCharacter } from "./InputCharacter";


export interface StringValueParser {

    /**
     * @param value string value to parse
     * @return processed and parsed Input Character
     */
    parse(value: string): InputCharacter[];
} 