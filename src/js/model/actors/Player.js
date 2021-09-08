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
import gsap          from "gsap";
import Weapons       from "@/definitions/Weapons";
import WeaponFactory from "@/factory/WeaponFactory";
import Ship          from "./Ship";
import Powerup       from "./Powerup";

const DEFAULT_ENERGY = 10;
const DEFAULT_WEAPON = 0;

const MIN_X = 0, MIN_Y = 0;
let MAX_X, MAX_Y;

class Player extends Ship {

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

        /**
         * @private
         * @type {number}
         */
        this._fireCount = 0;

        /* initialization */

        // Player is re-used through application lifetime

        this.pooled = true;
    }

    /* public methods */

    startFiring() {
        // as firing bullets triggers an expensive calculation, we proxy this onto
        // the next animationFrame so we calculate this only once per screen render
        this.firing  = true;
        this.fireRAF = requestAnimationFrame( this._fire.bind( this ));
    }

    stopFiring() {
        this.firing     = false;
        this._fireCount = 0;
        cancelAnimationFrame( this.fireRAF );
    }

    _fire() {
        if ( ++this._fireCount === this.fireSpeed ) {
            this.game.fireBullet( this );
            this._fireCount = 0;
        }
        if ( this.firing )
            this.startFiring();
    }

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

    cacheBounds() {
        MAX_X = this.game.world.width  - this.width;
        MAX_Y = this.game.world.height - this.height;
    }

    /**
     * @override
     * @protected
     * @param {number} targetLayer
     */
    _onLayerSwitch( targetLayer ) {
        super._onLayerSwitch( targetLayer );
        this.cacheBounds();
    }

    /**
     * some weapons are so awesome, we don't grant you the pleasure
     * of having them forever, when this timer expires, normal weapon
     * is used
     */
    setWeaponTimer() {
        this.killWeaponTimer();
        this._weaponTimer = gsap.delayedCall( 15, () => {
            WeaponFactory.applyToActor( Weapons.DEFAULT, this );
        });
    }

    killWeaponTimer() {
        if ( this._weaponTimer ) {
            this._weaponTimer.kill();
            this._weaponTimer = null;
        }
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
     * @override
     * @public
     */
    die() {
        this.stopFiring();
        super.die();
    }

    /**
     * @public
     */
    reset() {
        this.stopFiring();
        this.killWeaponTimer();

        this.energy     = DEFAULT_ENERGY;
        this.weapon     = DEFAULT_WEAPON;
        this.fireSpeed  = 5;
        this.score      = 0;
        this.collidable = true;

        // start centered horizontally at the bottom of the screen
        this.x = this.game.world.width / 2 - this.width / 2;
        this.y = this.game.world.height - ( this.height * 1.5 );

        this.xSpeed = 0;
        this.ySpeed = 0;
    }
};
export default Player;
