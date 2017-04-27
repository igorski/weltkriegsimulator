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
"use strict";

const Config  = require( "../../config/Config" );
const zCanvas = require( "zcanvas" );

module.exports = SkyRenderer;

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
function SkyRenderer( x, y, speed, scale ) {

    scale = ( typeof scale === "number" ) ? scale : 1;

    SkyRenderer.super(
        this, "constructor", x, y, 300 * scale, 508 * scale,
        Config.getBaseURL() + "/assets/images/sprites/clouds.png"
    );

    /* instance properties */

    /**
     * @public
     * @type {number}
     */
    this.speed = ( typeof speed === "number" ) ? speed : 1;
}
zCanvas.sprite.extend( SkyRenderer );

/* public methods */

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
SkyRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync();
    SkyRenderer.super( this, "draw", aCanvasContext );
};

SkyRenderer.prototype.sync = function() {

    this._bounds.top += this.speed;

    if ( this._bounds.top > this.canvas.getHeight() ) {
        this._bounds.top = -this._bounds.height;
        this._bounds.left = Math.round( Math.random() * this.canvas.getWidth() );
    }
};
