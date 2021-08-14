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
import Config        from "../../config/Config";
import Boss          from "../../model/actors/Boss";
import ActorRenderer from "./ActorRenderer";
import Assets        from "../../definitions/Assets";

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

        this.setBitmap( Assets.GRAPHICS.BOSS );
        this.setSheet([
                // Boss sprites (facing down)
                { row: 0, col: 0, fpt: 1, amount: 1 },
                { row: 0, col: 1, fpt: 1, amount: 1 }
            ],
            BossRenderer.TILE_SIZE.width,
            BossRenderer.TILE_SIZE.height
        );
    }


    /* public methods */

    /**
     * @override
     * @public
     * @param {CanvasRenderingContext2D} aCanvasContext
     */
    draw( aCanvasContext ) {

        this.sync(); // sync with model state

        if ( !this.canvas )
            return;

        if ( this._bitmapReady ) {

            // we override the draw method as we have different size sprites within the tile sheet
            // TODO: is this something we want to be able to solve from zCanvas itself ? ;)

            const bounds   = this._bounds,
                  aniProps = this._animation;

            // spritesheet defined, draw tile

            const width  = ( aniProps.tileWidth )  ? aniProps.tileWidth  : ( .5 + bounds.width )  << 0;
            const height = ( aniProps.tileHeight ) ? aniProps.tileHeight : ( .5 + bounds.height ) << 0;

            aCanvasContext.drawImage(
                this._bitmap,
                aniProps.col      * width,  // tile x offset
                aniProps.type.row * height, // tile y offset
                ( aniProps.col === 0 ) ? width : width * 2,
                height,
                ( .5 + bounds.left )   << 0,
                ( .5 + bounds.top )    << 0,
                ( .5 + ( ( aniProps.col === 0 ) ? bounds.width : bounds.width * 2 ))  << 0,
                ( .5 + bounds.height ) << 0
            );
        }
    }

    /**
     * @public
     */
    setSheetForBoss() {
        // type has 1:1 relation ship to the sheet for the Boss
        this.switchAnimation( this.actor.type );
    }
}

/**
 * dimensions of each tile in the spritesheet
 *
 * @public
 * @type {{width: number, height: number}}
 */
BossRenderer.TILE_SIZE = { width: 128, height: 128 };
