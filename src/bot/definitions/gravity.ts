export enum Gravity {
    LOW,
    MEDIUM,
    HIGH,
}

export function gravityToStr(gravity: Gravity) {
    return Gravity[gravity];
}