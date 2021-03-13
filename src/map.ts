import { Point } from "./common";

export const TilesWide = 16;
export const TilesTall = 16;
export const TilePxSize = 32;
export const FramePxSize = TilesWide * TilePxSize;

export const TileAir = 0;
export const TileDirt = 1;
export const TileStone = 2;

export type WorldPoint = Point;

type TileArray = Uint16Array;
function tileIndex(col: number, row: number) {
    if (col >= TilesWide || col < 0 || row >= TilesTall || row < 0) {
        let err = `Out of bounds frame index: (${col}, ${row})`;
        throw err;
    }
    return row * TilesWide + col;
}

export class Frame {
    tiles: TileArray;

    constructor(data?: TileArray) {
        if (data)
            console.assert(data.length == TilesWide * TilesTall, `Invalid size (#{data.length}), expected #{SlabsWide * SlabsTall}`);
        this.tiles = data || new Uint16Array(TilesWide * TilesTall);
    }

    getTile(col: number, row: number) {
        return this.tiles[tileIndex(col, row)];
    }

    setTile(col: number, row: number, tile: number) {
        this.tiles[tileIndex(col, row)] = tile;
    }
}

function createFrame(frameX: number): Frame {
    let floor = 8;
    let frame = new Frame();
    let i = 0;
    for (let y = 0; y < TilesTall; y++) {
        for (let x = 0; x < TilesWide; x++) {
            if (y > floor) {
                frame.setTile(x, y, (Math.abs(frameX) % 2) + 1);
            } else if (y == floor) {
                frame.setTile(x, y, TileDirt);
            } else {
                frame.setTile(x, y, TileAir);
            }
        }
    }
    return frame;
}

export enum TileDir {
    Up = 1,
    Down,
    Left,
    Right,
}

export type TilePoint = Point;

export function worldToTile(p: WorldPoint): TilePoint {
    return {x: Math.floor(p.x / TilePxSize), y: Math.floor(p.y / TilePxSize)};
}

export function getRelTile(p: TilePoint, dir: TileDir): TilePoint {
    if (dir === TileDir.Up) {
        p.y -= 1;
    } else if (dir === TileDir.Down) {
        p.y += 1;
    } else if (dir === TileDir.Right) {
        p.x += 1;
    } else if (dir === TileDir.Left) {
        p.x -= 1;
    }
    return p;
}

export class Map {
    private frames: {[frameNumber: string]: Frame};

    constructor() {
        this.frames = {};
    }

    getFrame(x: number, y: number): Frame {
        // TODO: add more complex loading
        let key = `${x},${y}`;
        if (this.frames[key] === undefined) {
            console.log(`loading frame ${key}`)
            this.frames[key] = createFrame(x);  
        }
        return this.frames[key];
    }

    private getFrameForTile(p: TilePoint): Frame {
        let frameX = Math.floor(p.x / TilesWide);
        let frameY = Math.floor(p.y / TilesTall);
        return this.getFrame(frameX, frameY);
    }

    getTile(p: TilePoint): number {
        const frame = this.getFrameForTile(p);
        return frame.getTile(p.x % TilesWide, p.y % TilesTall);
    }

    setTile(p: TilePoint, tile: number) {
        const frame = this.getFrameForTile(p);
        return frame.setTile(p.x % TilesWide, p.y % TilesTall, tile);
    }

    isGround(p: WorldPoint): boolean {
        const tile = this.getTile(worldToTile(p));
        return tile !== TileAir;
    }
}