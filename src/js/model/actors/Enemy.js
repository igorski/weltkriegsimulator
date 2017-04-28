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

const Ship = require( "./Ship" );

const DEFAULT_ENERGY = 1;
const DEFAULT_WEAPON = 0;

const SHOOT_INTERVAL = 1500;

module.exports = class Enemy extends Ship {

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

        /* instance properties */

        /**
         * @public
         * @type {number}
         */
        this.lastShot = 0;
    }

    /* public methods */

    /**
     * @override
     * @public
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {
        super.update( aTimestamp );

        if ( this.lastShot < ( aTimestamp - SHOOT_INTERVAL )) {
            this.lastShot = Date.now();
            this.game.fireBullet( this );
        }
    }

    /**
     * @public
     */
    reset() {
        this.energy     = DEFAULT_ENERGY;
        this.weapon     = DEFAULT_WEAPON;
        this.collidable = true;

        if ( this.renderer )
            this.renderer.switchAnimation( 1 );
    }
};
