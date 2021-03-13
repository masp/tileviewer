import { Point } from './common.js';
import { FramePxSize, TilePxSize, Map, Frame, TilesWide, TilesTall, TileAir, TileDirt, TileStone, WorldPoint, worldToTile } from './map.js';
import { Player } from './player.js';

const TileStyles = {
    [TileDirt]: '#573b0c', // dirt
    [TileStone]: '#b8b5bd', // stone
}

const ViewFrameWidth = 2;

export type ScreenPoint = Point;

class Camera {
    pos: WorldPoint;
}

export class Renderer {
    private camera: Camera;

    private bgCtx: CanvasRenderingContext2D;
    private gameCtx: CanvasRenderingContext2D;

    public showTileBorders: boolean;
    public showFrameBorders: boolean;

    constructor() {
        this.camera = {pos: {x: 0, y: FramePxSize / 2 + 50}};
        this.gameCtx = this.loadCanvas('game-layer');
        this.bgCtx = this.loadCanvas('bg-layer');
    }

    private loadCanvas(id: string): CanvasRenderingContext2D {
        let canvas = document.getElementById(id) as HTMLCanvasElement;
        let c = canvas.getContext('2d');
        c.imageSmoothingEnabled = false;
        return c;
    }

    private width(): number {
        return this.gameCtx.canvas.width;
    }

    private height(): number {
        return this.gameCtx.canvas.height;
    }

    private resetContextDims(ctx, w: number, h: number) {
        ctx.canvas.width = w;
        ctx.canvas.height = h;
    }

    private clearCtx(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    private clearGame() {
        this.clearCtx(this.gameCtx);
    }

    private clearBackground() {
        this.clearCtx(this.bgCtx);
    }

    onWindowResize(width: number, height: number) {
        this.resetContextDims(this.gameCtx, width, height);
        this.resetContextDims(this.bgCtx, width, height);
    }

    screenToWorld(p: ScreenPoint): WorldPoint {
        return {
            x: p.x - this.width()/2 + this.camera.pos.x,
            y: p.y - this.height()/2 + this.camera.pos.y,
        };
    }

    private renderTile(tile: number, x: number, y: number) {
        if (tile != TileAir) {
            this.bgCtx.fillStyle = TileStyles[tile];
            this.bgCtx.fillRect(
                x, // target x
                y, // target y
                TilePxSize, // target width
                TilePxSize // target height
            );
        }

        if (this.showTileBorders) {
            this.bgCtx.strokeStyle = 'black';
            this.bgCtx.strokeRect(x + 0.5, y + 0.5, TilePxSize, TilePxSize);
            this.bgCtx.font = '12px Arial';
            this.bgCtx.fillStyle = 'black';
            let tPos = worldToTile({x, y});
            this.bgCtx.fillText(`${tPos.x},${tPos.y}`, x, y + 16);
        }

    }

    private renderFrame(frameX: number, frame: Frame, x: number, y: number) {
        this.bgCtx.font = '72px Arial';
        this.bgCtx.fillText(frameX.toString(), x, y);
        for (let c = 0; c < TilesWide; c++) {
            for (let r = 0; r < TilesTall; r++) {
                let tile = frame.getTile(c, r);
                this.renderTile(tile, x + c * TilePxSize, y + r * TilePxSize);
            }
        }
        if (this.showFrameBorders) {
            this.bgCtx.strokeStyle = 'red';
            this.bgCtx.strokeRect(x + 0.5, y + 0.5, TilesWide * TilePxSize, TilesTall * TilePxSize);
        }
    }

    moveCamera(p: WorldPoint) {
        this.camera.pos = p;
    }

    renderBackground(map: Map) {
        this.clearBackground();
        this.bgCtx.save();
        let p = this.camera.pos;

        this.bgCtx.transform(1, 0, 0, 1, this.width()/2, this.height()/2)
        this.bgCtx.translate(-p.x, -p.y); // Camera at center of screen
        let frameX = Math.floor(p.x / FramePxSize)
        for (let start = frameX - ViewFrameWidth; start < frameX + ViewFrameWidth + 1; start++) {
            let frame = map.getFrame(start, 0);
            this.renderFrame(start, frame, start * FramePxSize, 0);
        }
        this.renderAura();
        this.bgCtx.restore();
    }

    private renderPlayer(player: Player) {
        let c = this.gameCtx;
        c.beginPath();
        let centerX = this.gameCtx.canvas.width / 2;
        let centerY = this.gameCtx.canvas.height / 2;
        c.fillStyle = 'red';
        c.arc(centerX, centerY, player.size, 0, 2 * Math.PI);
        c.fill();
    }

    private renderAura() {
        let tileOn = worldToTile(this.camera.pos);

        let c = this.bgCtx;
        c.fillStyle = 'rgba(0, 200, 0, 0.5)'
        c.fillRect(tileOn.x * TilePxSize, tileOn.y * TilePxSize, TilePxSize, TilePxSize);
    }

    renderGame(player: Player) {
        this.clearGame();
        this.camera.pos = player.pos;
        this.renderPlayer(player);
    }
}