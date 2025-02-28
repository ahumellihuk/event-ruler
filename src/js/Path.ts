export class Path {
    private static readonly SEPARATOR = '.';
    private path: string[] = [];
    private memo: string | null = null;

    push(s: string): void {
        this.memo = null;
        this.path.push(s);
    }

    pop(): string {
        this.memo = null;
        return this.path.pop()!;
    }

    name(): string {
        if (this.memo === null) {
            if (this.path.length === 0) {
                this.memo = '';
            } else {
                this.memo = this.path.join(Path.SEPARATOR);
            }
        }
        return this.memo;
    }

    extendedName(lastStep: string): string {
        const base = this.name();
        return base ? `${base}${Path.SEPARATOR}${lastStep}` : lastStep;
    }
} 