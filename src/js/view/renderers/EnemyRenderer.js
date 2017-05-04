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

const Config       = require( "../../config/Config" );
const Enemy        = require( "../../model/actors/Enemy" );
const ShipRenderer = require( "./ShipRenderer" );
const Assets       = require( "../../definitions/Assets" );

module.exports = EnemyRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Enemy} enemy
 * @param {RenderController} renderController
 */
function EnemyRenderer( enemy, renderController ) {

    EnemyRenderer.super( this, "constructor", enemy, renderController );
    this.setSheetForEnemy();
    this.canRumble = false;
}
ShipRenderer.extend( EnemyRenderer );

/* public methods */

/**
 * @public
 */
EnemyRenderer.prototype.setSheetForEnemy = function() {
    let animation = ShipRenderer.ANIMATION.ENEMY_1_IDLE;

    switch ( /** @type {Enemy} */ ( this.actor ).type ) {
        default:
            break;
        case 2:
            animation = ShipRenderer.ANIMATION.ENEMY_2_IDLE;
            break;
        case 3:
            animation = ShipRenderer.ANIMATION.ENEMY_3_IDLE;
            break;
    }
    this.switchAnimation( animation );
};
