/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
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
import Assets     from "@/definitions/Assets";
import { createCanvas } from "@/util/CanvasUtil";

const TILE_SIZE       = 16;
const FRAMES_PER_TILE = 5;
const AMOUNT_OF_TILES = 13;

export default class WaterRenderer extends sprite
{
    /**
     * a renderer that represents a water animation on screen
     *
     * @constructor
     */
    constructor() {

        super({ x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE });

        /* initialization */

        // WaterRenderer is special, we use a tiny spritesheet and flood fill
        // the entire screen to create an eternal ocean. For this purpose, each
        // tile in the spritesheet is converted to a pattern

        const bitmap = new Image();
        bitmap.src   = Assets.GRAPHICS.WATER;

        this.patterns = [];
        const { cvs, ctx } = createCanvas( TILE_SIZE, TILE_SIZE );
        for ( let i = 0; i < AMOUNT_OF_TILES; ++i ) {
            ctx.clearRect( 0, 0, TILE_SIZE, TILE_SIZE );
            ctx.drawImage( bitmap, 0, i * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE );
            this.patterns.push( ctx.createPattern( cvs, "repeat" ));
        }
        this.counter      = 0;
        this.patternIndex = 0;
    }

    /* public methods */

    cacheBounds() {
        this.screenWidth  = this.canvas.getWidth();
        this.screenHeight = this.canvas.getHeight();
    }

    draw( aCanvasContext ) {
        // manually update spritesheet index
        if ( ++this.counter === FRAMES_PER_TILE ) {
            if ( ++this.patternIndex >= AMOUNT_OF_TILES ) {
                this.patternIndex = 0;
            }
            this.counter = 0;
        }
        aCanvasContext.fillStyle = this.patterns[ this.patternIndex ];
        aCanvasContext.fillRect( 0, 0, this.screenWidth, this.screenHeight );
    }
}
