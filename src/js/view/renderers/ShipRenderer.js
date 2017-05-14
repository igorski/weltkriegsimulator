/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016-2017 - http://www.igorski.nl
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

const Config        = require( "../../config/Config" );
const Ship          = require( "../../model/actors/Ship" );
const ActorRenderer = require( "./ActorRenderer" );
const Assets        = require( "../../definitions/Assets" );

module.exports = ShipRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Ship} ship
 * @param {RenderController} renderController
 */
function ShipRenderer( ship, renderController ) {

    ShipRenderer.super( this, "constructor", ship, renderController );

    this.setBitmap( Assets.GRAPHICS.SHIP );
    this.setSheet([

            // Player ship (facing up)
            { row: 0, col: 0, fpt: 1, amount: 1 },

            // Enemy ships (facing down)
            { row: 0, col: 1, fpt: 1, amount: 1 },
            { row: 1, col: 0, fpt: 1, amount: 1 },
            { row: 1, col: 1, fpt: 1, amount: 1 }
        ],
        ShipRenderer.TILE_SIZE.width,
        ShipRenderer.TILE_SIZE.height
    );

    this.canRumble = true;
}
ActorRenderer.extend( ShipRenderer );

/**
 * dimensions of each tile in the spritesheet
 *
 * @public
 * @type {{width: number, height: number}}
 */
ShipRenderer.TILE_SIZE = { width: 64, height: 64 };

/**
 * all animations that are available to this renderer
 * these translate to animation indices in the sprite sheet
 *
 * @public
 * @type {Object}
 */
ShipRenderer.ANIMATION = {
    PLAYER_IDLE  : 0,
    ENEMY_1_IDLE : 1,
    ENEMY_2_IDLE : 2,
    ENEMY_3_IDLE : 3
};
