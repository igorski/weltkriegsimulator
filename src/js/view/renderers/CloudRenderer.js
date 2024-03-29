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
import Assets from "@/definitions/Assets";

export default class CloudRenderer extends Sprite
{
    /**
     * a renderer that draws some pretty nice lookin' sky details
     * there is no Actor for this renderer, it's merely decorative !
     *
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number=} speed
     * @param {number=} scale
     */
    constructor( gameModel, x, y, speed, scale ) {

        scale = ( typeof scale === "number" ) ? scale : 1;

        super({ x, y, width: 300 * scale, height: 508 * scale, resourceId: Assets.GRAPHICS.SKY.id });

        /* instance properties */

        /**
         * @public
         * @type {number}
         */
        this.speed = ( typeof speed === "number" ) ? speed : 1;

        gameModel.scenery.push( this );
    }

    /* public methods */

    /**
     * @override
     * @param {DOMHighResTimeStamp} timestamp 
     * @param {number} framesSinceLastRender 
     */
    update( timestamp, framesSinceLastRender ) {
        this._bounds.top += ( this.speed * framesSinceLastRender );

        // when moving out of the screen reset position to the top
        if ( this._bounds.top > this.canvas.getHeight() ) {
            this._bounds.top = -this._bounds.height;
            this._bounds.left = Math.round( Math.random() * this.canvas.getWidth() );
        }
    }
}
