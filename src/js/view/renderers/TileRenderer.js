/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016 - http://www.igorski.nl
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
import { sprite } from "zcanvas";
import Config     from "@/config/Config";
import TileUtil   from "@/util/TileUtil";
import Assets     from "@/definitions/Assets";

export default class TileRenderer extends sprite
{
    /**
     * a renderer that represents a tiled background on screen
     *
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number} speed
     * @param {number=} scale
     */
    constructor( x, y, speed, scale ) {

        super({ x, y });

        /* instance properties */

        this.speed = speed;

        /* initialization */

        const cvs = TileUtil.createTileMap( Assets.GRAPHICS.TILE, scale );
        this.setBitmap( cvs, cvs.width, cvs.height );
    }

    /* public methods */

    draw( aCanvasContext ) {
        // there is no associated Actor for a tile, run the update logic
        // inside the draw method
        this._bounds.top += this.speed;

        if ( this._bounds.top > this.canvas.getHeight() ) {
            this._bounds.top = -this._bounds.height;
            this._bounds.left = Math.round( Math.random() * this.canvas.getWidth() );
        }
        super.draw( aCanvasContext );
    }
}
