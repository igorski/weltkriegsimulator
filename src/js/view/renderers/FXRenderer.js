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
"use strict";

const Config  = require( "../../config/Config" );
const zCanvas = require( "zcanvas" );
const Assets  = require( "../../definitions/Assets" );

module.exports = FXRenderer;

/**
 * a renderer that renders different animations
 * like transition effects, explosions, etc.
 * this renderer does not belong to an Actor
 *
 * @constructor
 * @param {RenderController} renderController
 */
function FXRenderer( renderController ) {

    FXRenderer.super(
        this, "constructor", {
            x: 0, y: 0,
            width:  FXRenderer.TILE_SIZE.width,
            height: FXRenderer.TILE_SIZE.height
        }
    );

    const animationCompleteHandler = renderController.onFXComplete.bind( renderController, this );

    this.setBitmap( Assets.GRAPHICS.FX );
    this.setSheet([

            // Animation when Actor is switching layer
            { row: 0, col: 0, fpt: 2, amount: 8, onComplete: animationCompleteHandler },

            // Explosion
            { row: 1, col: 0, fpt: 3, amount: 16, onComplete: animationCompleteHandler }
        ],
        FXRenderer.TILE_SIZE.width,
        FXRenderer.TILE_SIZE.height
    );
}
zCanvas.sprite.extend( FXRenderer );

/**
 * dimensions of each tile in the spritesheet
 *
 * @public
 * @type {{width: number, height: number}}
 */
FXRenderer.TILE_SIZE = { width: 64, height: 64 };

/**
 * all animations that are available to this renderer
 * these translate to animation indices in the sprite sheet
 *
 * @public
 * @type {Object}
 */
FXRenderer.ANIMATION = {
    CLOUD    : 0,
    EXPLOSION: 1
};

/* public methods */

/**
 * @public
 * @param {Actor} actor
 * @param {number} animationIndex
 */
FXRenderer.prototype.showAnimation = function( actor, animationIndex ) {

    // animation gets equal width/height and coordinates of given actor

    this.setWidth ( actor.width );
    this.setHeight( actor.height );

    this.setX( actor.x + actor.offsetX );
    this.setY( actor.y + actor.offsetY );

    this.switchAnimation( animationIndex );
};

/**
 * @override
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
FXRenderer.prototype.draw = function( aCanvasContext ) {
    // need to manually trigger update (zCanvas has been
    // initialized to use an external update handler, which is
    // the gameloop in Game. The FXRenderer is not part
    // of the game loop as it has no associated Actor (TODO: is this logical?)

    this.update();

    FXRenderer.super( this, "draw", aCanvasContext );
};
