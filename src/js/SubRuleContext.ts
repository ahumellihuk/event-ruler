export class SubRuleContext {
    private readonly id: number;
    private readonly ruleName: any;

    constructor(id: number, ruleName: any) {
        this.id = id;
        this.ruleName = ruleName;
    }

    getRuleName(): any {
        return this.ruleName;
    }

    equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        if (obj instanceof SubRuleContext) {
            return this.id === obj.id;
        }
        return false;
    }

    hashCode(): number {
        return this.id;
    }
}

export class Generator {
    private readonly nameToContext: Map<any, Set<SubRuleContext>> = new Map();
    private nextId: number = 0;

    generate(ruleName: any): SubRuleContext {
        const subRuleContext = new SubRuleContext(this.nextId++, ruleName);
        if (!this.nameToContext.has(ruleName)) {
            this.nameToContext.set(ruleName, new Set());
        }
        this.nameToContext.get(ruleName)!.add(subRuleContext);
        return subRuleContext;
    }

    getIdsGeneratedForName(ruleName: any): Set<SubRuleContext> | undefined {
        return this.nameToContext.get(ruleName);
    }
} 