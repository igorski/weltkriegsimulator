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
import gsap, { Sine, Cubic } from "gsap";
import Ship         from "./Ship";
import Patterns     from "@/definitions/Patterns";
import Weapons      from "@/definitions/Weapons";
import ShipRenderer from "@/view/renderers/ShipRenderer";

const DEFAULT_ENERGY = 1;
const DEFAULT_WEAPON = Weapons.DEFAULT;

class Enemy extends Ship {

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
         * @type {number}
         */
        this.lastShot = 0;

        /**
         * @type {number}
         */
        this.type = type;

        /**
         * @type {number}
         */
        this.pattern = Patterns.VERTICAL_ONLY;

        /**
         * the interval (in milliseconds) at which an
         * Enemy will fire its weapon
         *
         * @protected
         * @type {number}
         */
        this._shootInterval = 1500;
    }

    /* public methods */

    /**
     * @override
     * @param {number} timestamp
     */
    update( timestamp ) {

        // no special behaviour if Enemy is outside the viewport

        const insideViewport = this.y > -this.height;

        if ( !insideViewport ) {
            return super.update( timestamp );
        }

        // fire a shot in case the shoot interval has passed

        if ( this.lastShot < ( timestamp - this._shootInterval )) {
            this.lastShot = timestamp;
            this.game.fireBullet( this );
        }

        if ( this.pattern === 0 ) {
            return super.update( timestamp );
        }
        if ( !this.trajectoryCalculated ) {
            this.calculateTrajectory();
        }
        this.y += ( this.layer === 0 ) ? this.ySpeed * .75 : this.ySpeed;

        // recalculate the hit box bounds

        if ( this.y > -this.height ) {
            this._cacheHitbox();
        }
    }

    calculateTrajectory() {
        const width = Math.min( this.game.world.width, ShipRenderer.TILE_SIZE.width * 10 );

        const speedMultiplier = ( this.layer === 0 ) ? 1.33 : 1;
        let targetX, speed, ease;
        switch ( this.pattern ) {
            // center sine movement
            default:
            case Patterns.WIDE_SINE:
                const { x } = this.game.player;
                const size  = Math.min( width, this.game.world.height ) * 0.5;
                const dX    = x + size > this.game.world.width ? ShipRenderer.TILE_SIZE.width : x;

                this.x  = dX + ( width * 0.5 - size * 0.5 );
                targetX = dX + ( width * 0.5 + size * 0.5 );
                speed   = 1;
                ease    = Sine.easeInOut;
                break;

            // move between edges of screen
            case Patterns.SIDEWAYS_CUBE:
                targetX = width - this.width;
                speed   = 3;
                ease    = Cubic.easeInOut;
                break;
        }

        // use GSAP to provide the math functions and updates for the flight pattern

        this.trajectoryTween = gsap.to( this, speed * speedMultiplier, {
            x: targetX, repeat: Infinity, yoyo: true, ease, onRepeat: () => {

                // enemies moving in a pattern are allowed to switch layer
                // to target the Player

                if ( this.game.player.layer !== this.layer ) {
                    this.switchLayer();
                }
            }
        });
        this.trajectoryCalculated = true;
    }

    reset() {
        this.energy     = DEFAULT_ENERGY;
        this.weapon     = DEFAULT_WEAPON;
        this.collidable = true;

        killTrajectory( this );
    }

    /**
     * @override
     * @protected
     * @param {number} targetLayer
     */
    _onLayerSwitch( targetLayer ) {
        if ( this.trajectoryTween ) {
            // if Enemy is moving in a trajectory during a layer switch, slowly
            // restore the offset coordinates (super behaviour would cause jump as trajectory
            // destination can't take offset deviation during layer switches into account)
            this.switching = false;
            this.game.completeActorLayerSwitch( this, targetLayer );
            gsap.to( this, 2, { offsetX: 0, offsetY: 0 });
            return;
        }
        super._onLayerSwitch( targetLayer );
    }

    /**
     * @override
     */
    die() {
        killTrajectory( this );
        super.die();
    }

    /**
     * @override
     */
    dispose() {
        killTrajectory( this );
        super.dispose();
    }
};
export default Enemy;

function killTrajectory( enemy ) {
    if ( enemy.trajectoryTween ) {
        enemy.trajectoryTween.kill();
        enemy.trajectoryTween = null;
    }
    enemy.trajectoryCalculated = false;
}
