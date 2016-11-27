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

const Bullet       = require( "../model/actors/Bullet" );
const ShipRenderer = require( "./ShipRenderer" );

module.exports = BulletRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Ship} bullet
 * @param {RenderController} renderController
 */
function BulletRenderer( bullet, renderController ) {
    BulletRenderer.super( this, "constructor", bullet, renderController );
}
ShipRenderer.extend( BulletRenderer );

/* public methods */

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
BulletRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync(); // sync with model state

    const actor      = this.actor,
          bulletSize = ( actor.layer === 1 ) ? actor.orgWidth : actor.orgWidth * .5;

    aCanvasContext.fillStyle = "white";
    aCanvasContext.fillRect(
        this._bounds.left,
        this._bounds.top,
        bulletSize, bulletSize
    );
};
