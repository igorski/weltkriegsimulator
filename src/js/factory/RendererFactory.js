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

const Bullet  = require( "../model/actors/Bullet" );
const Powerup = require( "../model/actors/Powerup" );
const Ship    = require( "../model/actors/Ship" );
const Enemy   = require( "../model/actors/Enemy" );
const Boss    = require( "../model/actors/Boss" );

/* renderers */

const BulletRenderer  = require( "../view/renderers/BulletRenderer" );
const PowerupRenderer = require( "../view/renderers/PowerupRenderer" );
const ShipRenderer    = require( "../view/renderers/ShipRenderer" );
const EnemyRenderer   = require( "../view/renderers/EnemyRenderer" );
const BossRenderer    = require( "../view/renderers/BossRenderer" );

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

        if ( actor.pooled && actor.renderer ) {
            if ( actor instanceof Enemy )
                actor.renderer.setSheetForEnemy();

            if ( actor instanceof Powerup )
                actor.renderer.setSheetForPowerup();

            return actor.renderer;
        }

        if ( actor instanceof Bullet ) {
            return new BulletRenderer( /** @type {Bullet} */ ( actor ), renderController );
        }
        else if ( actor instanceof Powerup ) {
            return new PowerupRenderer( /** @type {Powerup} */ ( actor ), renderController );
        }
        else if ( actor instanceof Boss ) {
            return new BossRenderer( /** @type {Boss} */ ( actor ), renderController );
        }
        else if ( actor instanceof Enemy ) {
            return new EnemyRenderer( /** @type {Enemy} */ ( actor ), renderController );
        }
        else if ( actor instanceof Ship ) {
            return new ShipRenderer( /** @type {Ship} */ ( actor ), renderController );
        }
        throw new Error( "could not create renderer for " + actor );
    }
};
