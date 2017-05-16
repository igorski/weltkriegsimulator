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
const Patterns     = require( "../../definitions/Patterns" );
const Weapons      = require( "../../definitions/Weapons" );
const ShipRenderer = require( "../../view/renderers/ShipRenderer" );

const DEFAULT_ENERGY = 1;
const DEFAULT_WEAPON = Weapons.DEFAULT;

module.exports = class Enemy extends Ship {

    /**
     * @constructor
     * @param {Game} game
     * @param {number=} energy
     * @param {number=} weapon
     * @param {number=} type
     */
    constructor( game, energy = DEFAULT_ENERGY, weapon = DEFAULT_WEAPON, type = 0 ) {

        /* inherit prototype properties of Ship */

        super( game, 0, 0, 0, 0, energy, weapon );

        /* instance properties */

        /**
         * @public
         * @type {number}
         */
        this.lastShot = 0;

        /**
         * @public
         * @type {number}
         */
        this.type = type;

        /**
         * the interval (in milliseconds) at which an
         * Enemy will fire its weapon
         *
         * @protected
         * @type {number}
         */
        this._shootInterval = 1500;

        /**
         * @public
         * @type {number}
         */
        this.pattern = Patterns.VERTICAL_ONLY;
    }

    /* public methods */

    /**
     * @override
     * @public
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {

        // no special behaviour if Enemy is outside the viewport

        const insideViewport = this.y > -this.height;

        if ( !insideViewport )
            return super.update( aTimestamp );

        // fire a shot in case the shoot interval has passed

        if ( this.lastShot < ( aTimestamp - this._shootInterval )) {
            this.lastShot = Date.now();
            this.game.fireBullet( this );
        }

        if ( this.pattern === 0 )
            return super.update( aTimestamp );

        if ( !this.trajectoryCalculated )
            this.calculateTrajectory();

        this.y += ( this.layer === 0 ) ? this.ySpeed * .75 : this.ySpeed;

        // recalculate the hit box bounds

        if ( this.y > -this.height )
            this._cacheHitbox();
    }

    calculateTrajectory() {

        const speedMultiplier = ( this.layer === 0 ) ? 1.33 : 1;
        let targetX, speed, ease;
        switch ( this.pattern ) {
            default:
            case Patterns.WIDE_SINE:
                this.x  = this.game.world.width * .25;
                targetX = this.game.world.width * .75;
                speed   = 1;
                ease    = Sine.easeInOut;
                break;

            case Patterns.SIDEWAYS_CUBE:
                targetX = this.game.world.width - this.width;
                speed   = 3;
                ease    = Cubic.easeInOut;
                break;
        }

        // use TweenMax to provide the math functions and updates for the flight pattern

        this.trajectoryTween = TweenMax.to( this, speed * speedMultiplier, {
            x: targetX, repeat: Infinity, yoyo: true, ease: ease
        });

        this.trajectoryCalculated = true;
    }

    /**
     * @public
     */
    reset() {
        this.energy     = DEFAULT_ENERGY;
        this.weapon     = DEFAULT_WEAPON;
        this.collidable = true;

        if ( this.trajectoryTween ) {
            this.trajectoryTween.kill();
            this.trajectoryTween = null;
        }
        this.trajectoryCalculated = false;

        if ( this.renderer )
            this.renderer.switchAnimation( ShipRenderer.ANIMATION.ENEMY_1_IDLE );
    }
};
