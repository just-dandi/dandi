export class RequiredPropertyError extends Error {
    constructor(public readonly propertyName: string | number) {
        super(`The '${propertyName}' property is required`)
    }
}
