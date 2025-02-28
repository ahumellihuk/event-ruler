export class SetOperations {
    private constructor() {}

    public static intersection<T>(set1: Set<T>, set2: Set<T>, addTo: Set<T>): void {
        SetOperations.intersectionWithTransform(set1, set2, addTo, t => t);
    }

    public static intersectionWithTransform<T, R>(set1: Set<T>, set2: Set<T>, addTo: Set<R>, transform: (t: T) => R): void {
        const smaller = set1.size <= set2.size ? set1 : set2;
        const larger = set1.size <= set2.size ? set2 : set1;
        for (const element of smaller) {
            if (larger.has(element)) {
                addTo.add(transform(element));
            }
        }
    }
} 