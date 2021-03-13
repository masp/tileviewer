export class Point {
    x: number = 0;
    y: number = 0;

    constructor(x?: number, y?: number) {
        if (x !== undefined)
            this.x = x;
        if (y !== undefined)
            this.y = y;
    }

    add(other: Point) {
        this.x += other.x;
        this.y += other.y;
    }

    mul(factor: number) {
        this.x *= factor;
        this.y *= factor;
    }
}