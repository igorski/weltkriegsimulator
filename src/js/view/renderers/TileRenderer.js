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

const Config   = require( "../../config/Config" );
const zCanvas  = require( "zcanvas" );
const TileUtil = require( "../../util/TileUtil" );
const Assets   = require( "../../definitions/Assets" );

module.exports = TileRenderer;

/**
 * a renderer that represents a tiled background on screen
 *
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} speed
 * @param {number=} scale
 */
function TileRenderer( x, y, speed, scale ) {

    TileRenderer.super( this, "constructor", x, y, 0, 0 );

    /* instance properties */

    this.speed = speed;

    /* initialization */

    const self = this;

    TileUtil.createTileMap( Assets.GRAPHICS.TILE, scale ).
        then(( cvs ) => {
            self.setBitmap( cvs, cvs.width, cvs.height );
        });
}

zCanvas.sprite.extend( TileRenderer );

/* public methods */

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
TileRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync();
    TileRenderer.super( this, "draw", aCanvasContext );
};

TileRenderer.prototype.sync = function() {

    this._bounds.top += this.speed;

    if ( this._bounds.top > this.canvas.getHeight() ) {
        this._bounds.top = -this._bounds.height;
        this._bounds.left = Math.round( Math.random() * this.canvas.getWidth() );
    }
};
