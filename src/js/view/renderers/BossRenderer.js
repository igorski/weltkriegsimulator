/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2017 - http://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import ActorRenderer from "./ActorRenderer";
import Boss from "@/model/actors/Boss";
import Assets from "@/definitions/Assets";

export default class BossRenderer extends ActorRenderer
{
    /**
     * a renderer that represents a Boss actor on screen
     *
     * @constructor
     * @param {Boss} boss
     * @param {RenderController} renderController
     */
    constructor( boss, renderController ) {
        super( boss, renderController );

        this.setResource( Assets.GRAPHICS.BOSS.id );
        this.setSheet([
                // Boss sprites (facing down)
                { row: 0, col: 0, fpt: 1, amount: 1, w: 2, h: 1 },
                { row: 0, col: 2, fpt: 1, amount: 1, w: 2, h: 1 },
                { row: 1, col: 0, fpt: 1, amount: 1, w: 2, h: 1 },
                { row: 1, col: 2, fpt: 1, amount: 1, w: 2, h: 1 },
                { row: 0, col: 4, fpt: 1, amount: 1, w: 2, h: 2 },
            ],
            BossRenderer.TILE_SIZE.width,
            BossRenderer.TILE_SIZE.height
        );

        this.lastEnergy = boss.energy;
    }


    /* public methods */

    /**
     * @override
     * @param {IRenderer} renderer
     */
    draw( renderer ) {

        if ( !this.canvas ) {
            return;
        }

        // we override the draw method as we have different size sprites within the tile sheet
        // TODO: is this something we want to be able to solve from zCanvas itself ? ;)

        const bounds = this._bounds;
        const { tileWidth, tileHeight, type } = this._animation;

        const isHit = this.actor.energy !== this.lastEnergy;

        // flash when hit
        if ( isHit ) {
            this.lastEnergy = this.actor.energy;
        }

        renderer.drawImageCropped(
            this._resourceId,
            type.col * tileWidth,
            type.row * tileHeight,
            tileWidth  * type.w,
            tileHeight * type.h,
            bounds.left,
            bounds.top,
            bounds.width,
            bounds.height, {
                alpha: isHit ? 0.5 : undefined
            }
        );
        /*
        if ( process.env.NODE_ENV === "development" ) {
            this.debug( aCanvasContext );
        }
        */
    }

    setSheetForBoss() {
        // type has 1:1 relation ship to the sheet for the Boss
        this.switchAnimation( this.actor.type );
    }
}

/**
 * dimensions of each tile in the spritesheet
 *
 * @type {{width: number, height: number}}
 */
BossRenderer.TILE_SIZE = { width: 128, height: 128 };
