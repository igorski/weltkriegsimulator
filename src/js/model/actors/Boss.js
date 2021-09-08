/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2017 - http://www.igorski.nl
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
import gsap         from "gsap";
import Enemy        from "./Enemy";
import Enemies      from "@/definitions/Enemies";
import Patterns     from "@/definitions/Patterns";
import Weapons      from "@/definitions/Weapons";
import BossRenderer from "@/view/renderers/BossRenderer";

const DEFAULT_ENERGY = 1;
const DEFAULT_WEAPON = Weapons.SPRAY;

class Boss extends Enemy {

    /**
     * @constructor
     * @param {Game} game
     * @param {number=} energy
     * @param {number=} weapon
     * @param {number=} type
     */
    constructor( game, energy = DEFAULT_ENERGY, weapon = DEFAULT_WEAPON, type = Enemies.BOSS.TYPE_1 ) {
        /* inherit prototype properties of Enemy */

        super( game, energy, weapon, type );

        /**
         * @protected
         * @type {number}
         */
        this._attack = 0;

        /* initialization */

        this.updateHitBox();

        this.crashable = false;

        // Boss will only fire when in range (see startAttack)
        this._shootInterval = Infinity;
    }

    /* public methods */

    /**
     * Not all Boss types are of equal dimensions
     */
    updateHitBox() {
        let { width, height } = BossRenderer.TILE_SIZE;
        switch ( this.type ) {
            default:
                break;
            case Enemies.BOSS.TYPE_1:
            case Enemies.BOSS.TYPE_2:
            case Enemies.BOSS.TYPE_3:
            case Enemies.BOSS.TYPE_4:
                width *= 2;
                break;
            case Enemies.BOSS.TYPE_5:
                width  *= 2;
                height *= 2;
                break;
        }
        this.width  = this.orgWidth  = width;
        this.height = this.orgHeight = height;

        this._cacheHitbox();

        if ( this.renderer ) {
            this.renderer.setWidth( width );
            this.renderer.setHeight( height );
        }
    }

    /**
     * @override
     * @param {number} timestamp
     */
    update( timestamp ) {

        // slowly move Boss into screen and then stop,
        // start swaying left right to target Player

        if ( this.ySpeed !== 0 && this.y > ( this.game.world.height * 0.5 - this.height )) {
            this.ySpeed = 0;
            this.startAttack();
        }
        super.update( timestamp );
    }

    /* protected methods */

    /**
     * Boss will switch between several attacks during his lifetime
     * this includes switching shooting interval speeds as well
     * as weapon types
     */
    startAttack() {
        clearAttackTimeout( this );
        const timeoutInSeconds = 3;

        switch ( this._attack ) {
            default:
                // start spraying bullets
                this.pattern = Patterns.SIDEWAYS_CUBE;
                this.weapon  = Weapons.SPRAY;
                this._shootInterval = 250;
                break;

            case 1:
                // temporary "silence" in firing
                this.weapon = Weapons.LASER;
                this._shootInterval = 2000;
                break;

            case 2:
                // start firing laser
                this._shootInterval = 17;
                break;
        }

        // switch to the Players layer just to be creepy

        if ( this.layer !== this.game.player.layer ) {
            this.switchLayer();
        }
        if ( ++this._attack > 2 ) {
            this._attack = 0;
        }
        this.attackTimeout = gsap.delayedCall( timeoutInSeconds, this.startAttack.bind( this ));
    }

    die() {
        clearAttackTimeout( this );
        super.die();
        this.game.onBossDeath();
    }

    dispose() {
        clearAttackTimeout( this );
        super.dispose();
    }

    reset() {
        clearAttackTimeout( this );
        super.reset();
        this._shootInterval = Infinity;
    }
};
export default Boss;

/* internal methods */

function clearAttackTimeout( boss ) {
    if ( boss.attackTimeout ) {
        boss.attackTimeout.kill();
        boss.attackTimeout = null;
    }
}
