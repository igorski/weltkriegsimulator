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
import { sprite }    from "zcanvas";
import Config        from "@/config/Config";
import TileGenerator from "@/util/TileGenerator";

export default class TileRenderer extends sprite
{
    /**
     * a renderer that represents a tiled background on screen
     *
     * @constructor
     * @param {number} y
     * @param {number} speed
     * @param {number} type
     * @param {number=} scale
     */
    constructor( y, speed, type, scale ) {

        super({ x: 0, y });

        /* instance properties */

        this.speed = speed;

        /* initialization */

        const generateFn = type === TileRenderer.TYPE.ISLAND ? TileGenerator.createIslandTileMap : TileGenerator.createTileMap;

        const cvs = generateFn( scale );
        this.setBitmap( cvs, cvs.width, cvs.height );
    }

    /* public methods */

    setCanvas( canvas ) {
        super.setCanvas( canvas );
        positionOnRandomX( this );
    }

    draw( aCanvasContext ) {
        // there is no associated Actor for a tile, run the update logic
        // inside the draw method
        this._bounds.top += this.speed;
        // when moving out of the screen reset position to the top
        if ( this._bounds.top > this.canvas.getHeight() ) {
            this._bounds.top = -Math.round( this._bounds.height * ( 1 + Math.random() ));
            positionOnRandomX( this );
        }
        super.draw( aCanvasContext );
    }
}

/* class constants */

TileRenderer.TYPE = {
    STONE  : 0,
    ISLAND : 1
};

/* internal methods */

function positionOnRandomX( sprite ) {
    sprite.setX( Math.round( Math.random() * sprite.canvas.getWidth() ));
}
