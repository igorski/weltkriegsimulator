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

const Actor  = require( "./Actor" );
const Bullet = require( "./Bullet" );

module.exports = class Ship extends Actor {

    /**
     * @constructor
     *
     * @param {Game} game
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number} energy
     * @param {number} weapon
     */
    constructor( game, x, y, xSpeed, ySpeed, energy, weapon ) {

        /* inherit prototype properties of Actor */

        super( game, x, y, xSpeed, ySpeed );

        /* instance properties */

        /**
         * @public
         * @type {number}
         */
        this.energy = energy;

        /**
         * @public
         * @type {number}
         */
        this.maxEnergy = this.energy;

        /**
         * @public
         * @type {number}
         */
        this.weapon = weapon;

        /* initialization */

        this.width  = this.orgWidth  =
        this.height = this.orgHeight = 64; // spritesheet tile
    }

    /* public methods */

    /**
     * @override
     * @public
     * @param {Object=} actor optional Actor to collide with, if null
     *        hit is presumed to be fatal, Actor energy depletes
     */
    hit( actor ) {

        if ( !this.collidable )
            return;

        if ( actor instanceof Bullet ) {
            // colliding with others' Bullets
            if ( actor.owner !== this ) {
                this.energy = Math.max( 0, this.energy - actor.damage );
                actor.dispose(); // Bullets disappear on impact
            }
        }
        else if ( actor && actor.collidable ) {
            // colliding with another Object, ouch!
            this.energy = 0;
            if ( actor instanceof Ship ) {
                actor.energy = 0;
                actor.die();
            }
        }
        if ( this.energy === 0 )
            this.die();
    }

    die() {
        this.collidable = false;

        if ( this.renderer ) {
            this.renderer.switchAnimation( 2 );
        }
    }
};
