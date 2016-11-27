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

const zCanvas = require( "zcanvas" );
const Ship    = require( "../model/actors/Ship" );

module.exports = ShipRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Ship} ship
 * @param {RenderController} renderController
 */
function ShipRenderer( ship, renderController ) {

    ShipRenderer.super(
        this, "constructor", {
            x      : ship.x,
            y      : ship.y,
            width  : ship.width,
            height : ship.height,
            bitmap : "./assets/images/sprites/ship_spritesheet.png",
            sheet: [
                { row: 0, col: 0, fpt: 3, amount: 1 },  // Player ship, facing up
                { row: 1, col: 0, fpt: 3, amount: 1 },  // Enemy ship, facing down
                { row: 2, col: 0, fpt: 3, amount: 16, onComplete: ship.dispose.bind( ship ) } // Explosion
            ]
        }
    );

    /* instance properties */

    /**
     * @protected
     * @type {Actor}
     */
    this.actor = ship;

    /**
     * @protected
     * @type {RenderController}
     */
    this.renderController = renderController;

    /**
     * @public
     * @type {{ lastLayer: number }}
     */
    this.cache = {
        lastLayer: NaN
    };

    /* initialization */

    ship.renderer = this;

    this.sync();
}
zCanvas.sprite.extend( ShipRenderer );

/* public methods */

ShipRenderer.prototype.sync = function() {

    const actor  = this.actor;
    const bounds = this._bounds;

    // cache render parameters

    bounds.left = actor.x;
    bounds.top  = actor.y;

    if ( actor.layer !== this.cache.lastLayer ) {

        bounds.width  = actor.width;
        bounds.height = actor.height;

        this.cache.lastLayer = actor.layer;
    }
    this.updateAnimation(); // update spritesheet animation
};

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
ShipRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync(); // sync with model state

    if ( !this._bitmapReady )
        return; // nothing to render yet

    const bounds   = this._bounds,
          aniProps = this._animation;

    // apply rumble when applicable

    const rumbleObject = this.renderController.rumbling;
    if ( rumbleObject.active === true ) {
        bounds.left -= rumbleObject.x;
        bounds.top  -= rumbleObject.y;
    }

    // draw tile from spritesheet
    // note we use a fast rounding operation on the
    // optionally floating point Bounds values

    aCanvasContext.drawImage(
        this._bitmap,
        aniProps.col      * 64,  // tile x offset * tile width
        aniProps.type.row * 64,  // tile y offset * tile height
        64, 64, // tile width and height
        ( .5 + bounds.left )   << 0,
        ( .5 + bounds.top )    << 0,
        ( .5 + bounds.width )  << 0,
        ( .5 + bounds.height ) << 0
    );
};
