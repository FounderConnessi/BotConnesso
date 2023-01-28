export enum Gravity {
    LOW,
    MEDIUM,
    HIGH,
}

export function gravityToStr(gravity: Gravity) {
    return Gravity[gravity];
}

export function translateGravity(gravity) : string {
    switch (gravity) {
        case "HIGH":
            return "alta";
        case "MEDIUM":
            return "media";
        case "LOW":
            return "bassa";
    }
}