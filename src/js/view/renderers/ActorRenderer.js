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

module.exports = ActorRenderer;

/**
 * a renderer that represents the Actor actor on screen
 *
 * @constructor
 * @param {Actor} actor
 * @param {RenderController} renderController
 */
function ActorRenderer( actor, renderController ) {

    ActorRenderer.super(
        this, "constructor", {
            x      : actor.x,
            y      : actor.y,
            width  : actor.width,
            height : actor.height
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
     * whether this renderer can show rumble
     * @type {boolean}
     */
    this.canRumble = false;

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
zCanvas.sprite.extend( ActorRenderer );

/* public methods */

ActorRenderer.prototype.sync = function() {

    const actor  = this.actor;
    const bounds = this._bounds;

    // cache render parameters

    bounds.left = ( actor.x + actor.offsetX );
    bounds.top  = ( actor.y + actor.offsetY );

    if ( actor.layer !== this.cache.lastLayer ) {

        bounds.width  = actor.width;
        bounds.height = actor.height;

        this.cache.lastLayer = actor.layer;
    }

    // update spritesheet animation

    if ( this._animation )
        this.updateAnimation();
};

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
ActorRenderer.prototype.draw = function( aCanvasContext ) {

    this.sync(); // sync with model state

    // apply rumble when applicable

    if ( this.canRumble ) {
        const rumbleObject = this.renderController.rumbling;
        if ( rumbleObject.active === true ) {
            this._bounds.left -= rumbleObject.x;
            this._bounds.top  -= rumbleObject.y;
        }
    }
    ActorRenderer.super( this, "draw", aCanvasContext );
};
