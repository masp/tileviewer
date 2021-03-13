import { getRelTile, Map, worldToTile, TileAir, TileDir, WorldPoint, TileDirt, TilePoint } from './map.js';
import { Renderer, ScreenPoint } from './renderer.js';
import { Player } from './player.js';

class Timer {
    last: number;
    elapsed: number;
    tick: number = 1000 / 20; // 20 ticks every second

    constructor() {
        this.last = performance.now();
        this.elapsed = 0;
    }
}



class Game {
    renderer: Renderer;
    map: Map;
    time: Timer;
    player: Player;

    constructor() {
        this.renderer = new Renderer();
        this.map = new Map();
        this.time = new Timer();
        this.player = new Player();
    }

    onWindowResize() {
        let div = document.getElementById("render") as HTMLDivElement;
        let width = div.clientWidth;
        let height = div.clientHeight;
        this.renderer.onWindowResize(width, height);
    }

    onKeyDown(ev) {
        if (ev.code == "ArrowRight") {
            this.player.updateVelX(-2);
        }
        if (ev.code == "ArrowLeft") {
            this.player.updateVelX(2);
        }
        if (ev.code == "ArrowUp") {
            if (this.player.onGround())
                this.player.updateVelY(-5); // px/tick
        }
    }

    onClick(p: ScreenPoint) {
        let tilePos = worldToTile(this.renderer.screenToWorld(p));
        console.log(`clicked: ${tilePos.x}, ${tilePos.y}`);
        let prevTile = this.map.getTile(tilePos);
        let newTile = TileAir;
        if (prevTile === TileAir) {
            newTile = TileDirt;
        }
        this.map.setTile(tilePos, newTile);
    }

    update(delta) {
        const gravity = 0.3; // px/tick
        let newVel: WorldPoint = {x: this.player.velocity().x, y: this.player.velocity().y + gravity * delta};

        let newPos = this.player.pos.add(newVel.mul(delta));
        let playerOffset = Math.sign(newVel) * (this.player.size);
        if (this.map.isGround({x: this.player.pos.x, y: newPos + playerOffset})) {
            this.player.updateVelY(0);
        } else {
            this.player.updateVelY(newVel);
            this.player.pos.y = newPos;
        }
    }

    tick(now: number) {
        this.time.elapsed = now - this.time.last;
        const delta = this.time.elapsed / this.time.tick;

        this.update(delta);
        this.renderer.renderBackground(this.map);
        this.renderer.renderGame(this.player);

        this.time.last = now;
        requestAnimationFrame((now) => this.tick(now));
    }
}

let game: Game;

// Global UI settings
document.getElementById('border-frame').addEventListener("click", () => {
    game.renderer.showFrameBorders = !game.renderer.showFrameBorders;
});

document.getElementById('border-tile').addEventListener("click", () => {
    game.renderer.showTileBorders = !game.renderer.showTileBorders;
});

window.onresize = () => {
    game.onWindowResize();
}

window.onkeydown = event => {
    if (event.isComposing || event.keyCode == 229)
        return;
    game.onKeyDown(event);
}

let canvas = document.getElementById('game-layer');
canvas.onclick = event => {
    game.onClick({x: event.offsetX, y: event.offsetY});
}

window.onload = async () => {
    game = new Game();
    game.onWindowResize();
    requestAnimationFrame((now) => game.tick(now));
}