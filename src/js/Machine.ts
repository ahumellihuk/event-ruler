import { GenericMachine } from "./GenericMachine";
import { GenericMachineConfiguration } from "./GenericMachineConfiguration";

export class Machine extends GenericMachine<string> {
    constructor();
    constructor(configuration?: GenericMachineConfiguration) {
        super(configuration);
    }

    static builder(): Builder {
        return new Builder();
    }
}

export class Builder extends GenericMachine.Builder<Machine, string> {
    constructor() {
        super();
    }

    build(): Machine {
        return new Machine(this.buildConfig());
    }
} 