export enum Gravity {
    LOW,
    MEDIUM,
    HIGH,
}

export function gravityToStr(gravity: Gravity) {
    return Gravity[gravity];
}

export function translateGravity(gravity: Gravity) : string {
    switch (gravity) {
        case Gravity.HIGH:
            return "alta";
        case Gravity.MEDIUM:
            return "media";
        case Gravity.LOW:
            return "bassa";
    }
}