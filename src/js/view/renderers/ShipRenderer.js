/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016-2017 - http://www.igorski.nl
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
import Config        from "@/config/Config";
import Ship          from "@/model/actors/Ship";
import Assets        from "@/definitions/Assets";

export default class ShipRenderer extends ActorRenderer
{
    /**
     * a renderer that represents the Ship actor on screen
     *
     * @constructor
     * @param {Ship} ship
     * @param {RenderController} renderController
     */
    constructor( ship, renderController ) {
        super( ship, renderController );

        this.setBitmap( Assets.GRAPHICS.SHIP.img );
        this.setSheet([
                // These indices follow the declaration in definitions/Enemies.js
                { row: 0, col: 0, fpt: 1, amount: 1 }, // player ship (facing up, others face down)
                { row: 0, col: 1, fpt: 1, amount: 1 }, // squadron type 1
                { row: 1, col: 0, fpt: 1, amount: 1 }, // squadron type 2
                { row: 1, col: 1, fpt: 1, amount: 1 }, // squadron type 3
                { row: 0, col: 2, fpt: 1, amount: 1 }, // mine
                { row: 1, col: 2, fpt: 1, amount: 1 }, // alien
                { row: 0, col: 3, fpt: 1, amount: 1 }, // saucer
                { row: 1, col: 3, fpt: 1, amount: 1 }  // freighter
            ],
            ShipRenderer.TILE_SIZE.width,
            ShipRenderer.TILE_SIZE.height
        );
        this.canRumble = true;
    }
}

/**
 * dimensions of each tile in the spritesheet
 *
 * @public
 * @type {{width: number, height: number}}
 */
ShipRenderer.TILE_SIZE = { width: 64, height: 64 };
