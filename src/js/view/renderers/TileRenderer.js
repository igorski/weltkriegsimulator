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
import { Sprite } from "zcanvas";
import TileGenerator from "@/util/TileGenerator";

let instance = 0;

export default class TileRenderer extends Sprite
{
    /**
     * a renderer that represents a tiled background on screen
     *
     * @constructor
     * @param {GameModel} gameModel
     * @param {Canvas} zCanvas instance
     * @param {number} y
     * @param {number} speed
     * @param {number} type
     * @param {number=} scale
     */
    constructor( gameModel, zCanvas, y, speed, type, scale ) {
        super({ x: 0, y, width: 1, height: 1 });

        ++instance;

        gameModel.scenery.push( this );

        /* instance properties */

        this.speed = speed;
        
        /* Bitmap pre-render */

        const resourceId = "tile_" + instance;
        const generateFn = type === TileRenderer.TYPE.ISLAND ? TileGenerator.createIslandTileMap : TileGenerator.createTileMap;

        zCanvas.loadResource( resourceId, generateFn( scale ))
            .then( size => {
                this.setResource( resourceId, size.width, size.height );
                // cache pixel map for collision detection
                zCanvas.collision.cache( resourceId );
            });
    }

    /* public methods */

    setCanvas( canvas ) {
        super.setCanvas( canvas );
        positionOnRandomX( this );
    }

    /**
     * @override
     * @param {DOMHighResTimeStamp} timestamp 
     * @param {number} framesSinceLastRender 
     */
    update( timestamp, framesSinceLastRender ) {
        const speed = this.speed * framesSinceLastRender;

        this.setY( this.getY() + speed );
        
        // when moving out of the screen reset position to the top
        if ( this.getY() > this.canvas.getHeight() ) {
            this.setY( -Math.round( this.getHeight() * ( 1 + Math.random() )));
            positionOnRandomX( this );
        }
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
