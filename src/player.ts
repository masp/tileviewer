import { WorldPoint } from "./map";

export class Player {
    pos: WorldPoint = {x: 0, y: 0};
    size: number = 15;

    private velX: number = 0;
    private velY: number = 0;
    private isGrounded: boolean;

    onGround() { return this.isGrounded; }

    velocity(): WorldPoint { return {x: this.velX, y: this.velY}; }
    updateVelY(velY: number) {
        if (velY !== 0) {
            this.velY = velY;
            this.isGrounded = false;
        } else {
            this.velY = 0;
            this.isGrounded = true;
        }
    }

    updateVelX(velX: number) {
        this.velX = velX;
    }
}