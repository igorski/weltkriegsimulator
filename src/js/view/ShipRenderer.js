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
const Actor = require( "../model/actors/Actor" );

module.exports = ShipRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Actor} actor
 * @param {RenderController} renderController
 */
function ShipRenderer( actor, renderController ) {

    ShipRenderer.super(
        this, "constructor", {
            x: actor.x,
            y: actor.y,
            width: actor.width,
            height: actor.height,
            bitmap: "./assets/images/sprites/ship.png"
        }
    );

    /* instance properties */

    /**
     * @protected
     * @type {Actor}
     */
    this.actor = actor;

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

    actor.renderer = this;

    this.sync();
}
zCanvas.sprite.extend( ShipRenderer );

/* public methods */

ShipRenderer.prototype.sync = function() {

    const actor  = this.actor;
    const bounds = this._bounds;

    // cache render parameters

    bounds.left = actor.x;
    bounds.top = actor.y;

    if ( actor.layer !== this.cache.lastLayer ) {

        this.cache.lastLayer = actor.layer;

        const multiplier = 1 - ( actor.layer );

        bounds.width  = actor.width + ( actor.width * multiplier );
        bounds.height = actor.height + ( actor.height * multiplier );
    }
};

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
ShipRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync(); // sync with model state

    if ( !this._bitmapReady )
        return;

    // apply rumble when applicable

    const rumbleObject = this.renderController.rumbling;
    if ( rumbleObject.active === true ) {
        this._bounds.left -= rumbleObject.x;
        this._bounds.top  -= rumbleObject.y;
    }

    aCanvasContext.drawImage(
        this._bitmap,
        this._bounds.left, this._bounds.top, this._bounds.width, this._bounds.height
    );
};
