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

const Ship         = require( "./Ship" );
const Powerup      = require( "./Powerup" );
const ShipRenderer = require( "../../view/renderers/ShipRenderer" );

const DEFAULT_ENERGY = 10;
const DEFAULT_WEAPON = 0;

const MIN_X = 0, MIN_Y = 0;
let MAX_X, MAX_Y;

module.exports = class Player extends Ship {

    /**
     * @constructor
     * @param {Game} game
     * @param {number=} energy
     * @param {number=} weapon
     */
    constructor( game, energy, weapon ) {

        /* inherit prototype properties of Ship */

        energy = ( typeof energy === "number" ) ? energy : DEFAULT_ENERGY;
        weapon = ( typeof weapon === "number" ) ? weapon : DEFAULT_WEAPON;

        super( game, 0, 0, 0, 0, energy, weapon );

        /**
         * @public
         * @type {number}
         */
        this.score = 0;

        /**
         * @public
         * @type {string}
         */
        this.name = "";

        // Player is re-used through appication lifetime

        this.pooled = true;
    }

    /* public methods */

    /**
     * @override
     * @public
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {
        super.update( aTimestamp );

        // keep Player within world bounds

        if ( this.x > MAX_X )
            this.x = MAX_X;
        else if ( this.x < MIN_X )
            this.x = MIN_X;

        if ( this.y > MAX_Y )
            this.y = MAX_Y;
        else if ( this.y < MIN_Y )
            this.y = MIN_Y;
    }

    /**
     * @public
     */
    cacheBounds() {
        MAX_X = this.game.world.width  - this.width;
        MAX_Y = this.game.world.height - this.height;
    }

    /**
     * @override
     * @protected
     */
    _onLayerSwitch() {
        super._onLayerSwitch();
        this.cacheBounds();
    }

    /**
     * @override
     * @public
     * @param {Object=} actor
     */
    hit( actor ) {

        if ( actor instanceof Powerup ) {
            this.game.onPowerup( actor );
            actor.dispose();
        }
        else {
            super.hit( actor );
        }
    }

    /**
     * @public
     */
    reset() {
        this.energy     = DEFAULT_ENERGY;
        this.weapon     = DEFAULT_WEAPON;
        this.score      = 0;
        this.collidable = true;

        // start centered horizontally at the bottom of the screen
        this.x = this.game.world.width / 2 - this.width / 2;
        this.y = this.game.world.height - ( this.height * 1.5 );

        if ( this.renderer )
            this.renderer.switchAnimation( ShipRenderer.ANIMATION.PLAYER_IDLE );
    }
};
