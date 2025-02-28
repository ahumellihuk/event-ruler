/**
 * Configuration for a GenericMachine. For descriptions of the options, see GenericMachine.Builder.
 */
export class GenericMachineConfiguration {

    private readonly additionalNameStateReuse: boolean;

    constructor(additionalNameStateReuse: boolean) {
        this.additionalNameStateReuse = additionalNameStateReuse;
    }

    isAdditionalNameStateReuse(): boolean {
        return this.additionalNameStateReuse;
    }
} 