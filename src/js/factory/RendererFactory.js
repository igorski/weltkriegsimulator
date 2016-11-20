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

/* actors */

const Actor   = require( "../model/actors/Actor" );
const Bullet  = require( "../model/actors/Bullet" );
const Powerup = require( "../model/actors/Powerup" );

/* renderers */

const BulletRenderer  = require( "../view/BulletRenderer" );
const PowerupRenderer = require( "../view/PowerupRenderer" );
const ShipRenderer    = require( "../view/ShipRenderer" );

module.exports = {

    /**
     * create the renderer to represent given Actor on-screen
     *
     * @public
     * @param {Object} actor
     * @param {RenderController} renderController
     * @return {zSprite}
     */
    createRenderer( actor, renderController ) {

        // return pooled renderer if one already existed

        if ( actor.pooled && actor.renderer )
            return actor.renderer;

        if ( actor instanceof Bullet ) {
            return new BulletRenderer( /** @type {Bullet} */ ( actor ), renderController );
        }
        else if ( actor instanceof Powerup ) {
            return new PowerupRenderer( /** @type {Powerup} */ ( actor ), renderController );
        }
        else if ( actor instanceof Actor ) {
            return new ShipRenderer( /** @type {Actor} */ ( actor ), renderController );
        }
    }
};
