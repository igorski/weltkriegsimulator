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

const Pubsub    = require( "pubsub-js" );
const Messages  = require( "../../definitions/Messages" );
const ActorUtil = require( "../../util/ActorUtil" );

module.exports = class Actor {

    /**
     * @constructor
     *
     * @param {Game} game
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number} layer
     */
    constructor( game, x, y, xSpeed, ySpeed, layer ) {

        /* instance properties */

        /**
         * @protected
         * @type {Game}
         */
        this.game = game;

        /**
         * the layer this Actor is operating on
         * 1 = top, 0 = bottom
         *
         * @public
         * @type {number}
         */
        this.layer = ( typeof layer === "number" ) ? layer : 1;

        /**
         * @public
         * @type {number}
         */
        this.xSpeed = ( typeof xSpeed === "number" ) ? xSpeed : 0;

        /**
         * @public
         * @type {number}
         */
        this.ySpeed = ( typeof ySpeed === "number" ) ? ySpeed : 0;

        // absolute coordinates for this Actor within the world

        /**
         * @public
         * @type {number}
         */
        this.x = ( typeof x === "number" ) ? x : 0;

        /**
         * absolute coordinate for this Actor within the world
         *
         * @public
         * @type {number}
         */
        this.y = ( typeof y === "number" ) ? y : 0;

        // temporary offset (as in: margin) that can be used
        // at certain times (e.g. layer transitions)

        /**
         * @public
         * @type {number}
         */
        this.offsetX = 0;

        /**
         * @public
         * @type {number}
         */
        this.offsetY = 0;

        /**
         * @public
         * @type {number}
         */
        this.width = 25;

        /**
         * @public
         * @type {number}
         */
        this.height = 25;

        /**
         * Box to determine collision area
         * (it is slightly smaller than the actual bounds of the actor which
         * match the size of its renderer)
         *
         * @public
         * @type {{ left: number, top: number, right: number, bottom: number }}
         */
        this.hitBox = { left: 0, top: 0, right: 0, bottom: 0 };

        /**
         * @public
         * @type {ActorRenderer}
         */
        this.renderer = null;

        /**
         * whether this Actor is kept inside a Pool for re-use
         * (for instance: Bullets) if so, we can also pool the renderer
         *
         * @public
         * @type {boolean}
         */
        this.pooled = false;

        /**
         * @public
         * @type {boolean}
         */
        this.disposed = false;

        /**
         * whether other Actors can collide with this Actor
         *
         * @type {boolean}
         */
        this.collidable = true;

        /* initialization */

        // the dimensions this Actor occupies at the highest layer (1)

        this.orgWidth  = this.width;
        this.orgHeight = this.height;

        this._cacheHitbox();
    }

    /* public methods */

    /**
     * @public
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {

        // update Actor position by its speed

        if ( this.layer === 0 ) {
            // if Actor is on lower layer, reduce the speed
            this.x += ( this.xSpeed * .75 );
            this.y += ( this.ySpeed * .75 );
        }
        else {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
        }

        // recalculate the hit box bounds if this Actor is inside the viewport

        if ( this.y > -this.height )
            this._cacheHitbox();
    }

    /**
     * whether this Actor collides with given Actor
     *
     * @param {Actor} actor
     */
    collides( actor ) {

        if ( !actor.collidable || actor.layer !== this.layer || actor === this )
            return false;

        const myBox = this.hitBox, otherBox = actor.hitBox;

        return !(
            ( myBox.bottom < otherBox.top ) ||
            ( myBox.top    > otherBox.bottom ) ||
            ( myBox.right  < otherBox.left ) ||
            ( myBox.left   > otherBox.right )
        );
    }

    /**
     * @public
     * @param {Object=} actor optional Actor to collide with
     */
    hit( actor ) {

        // extend in inheriting classes
    }

    /**
     * @public
     * @param {number=} switchSpeed
     */
    switchLayer( switchSpeed = 1 ) {

        if ( this.switching )
            return;

        const self        = this;
        self.switching    = true;
        const targetLayer = ( self.layer === 0 ) ? 1 : 0;

        // during animation layer is floating point
        // we multiply by .5 as a lower layer Actor is displayed at half size

        const multiplier = targetLayer * .5;

        const width  = this.orgWidth  * .5 + ( this.orgWidth  * multiplier );
        const height = this.orgHeight * .5 + ( this.orgHeight * multiplier );

        // animate the following properties
        // note we animate offsetX and offsetY (instead of direct X and Y)
        // to keep the relative coordinate centered (relative from its unscaled poiont)
        // this allows us to change Actor position during the animation of the layer
        // switch (for instance: Player to keep moving during dive/rise)

        ActorUtil.setDelayed( self,
            [ "layer", "offsetX", "offsetY", "width", "height" ],
            [
                targetLayer,
                (( this.width * .5 ) - ( width  * .5 )),
                (( this.width * .5 ) - ( height * .5 )),
                width, height
            ],
            switchSpeed, () => {
                self.layer = targetLayer; // overcome JS rounding errors
                self._onLayerSwitch();
            },
            Cubic.easeOut, () => self._cacheHitbox()
        );
    }

    /**
     * Invoke whenever Actor is no longer part of the Game
     *
     * @public
     */
    dispose() {

        if ( this.disposed )
            return;

        this.disposed = true;

        this.game.removeActor( this );

        if ( this.renderer ) {

            if ( this.pooled && this.renderer.getParent() ) {
                this.renderer.getParent().removeChild( this.renderer );
            }
            else {
                this.renderer.dispose();
                this.renderer = null;
            }
        }
    }

    /* protected methods */

    /**
     * invoked whenever the layer switch animation
     * has completed
     *
     * @protected
     */
    _onLayerSwitch() {
        this.switching = false;
        this.game.completeActorLayerSwitch( this );

        // commit the offset to the final coordinate now
        // that the layer switch animation has completed

        this.x += this.offsetX;
        this.y += this.offsetY;

        // restore offset

        this.offsetX =
        this.offsetY = 0;
    }

    /**
     * cache the properties of this Actors hitbox, invoke
     * whenever dimensions of the Actor change
     *
     * @protected
     */
    _cacheHitbox() {

        // relative to the bounds described by x, y, width, and height
        // we want to hitbox to be inside this area by this margin
        const margin = this.width * .25;

        this.hitBox.left   = this.x + this.offsetX + margin;
        this.hitBox.top    = this.y + this.offsetY + margin;
        this.hitBox.right  = this.x + this.offsetX + ( this.width  - margin );
        this.hitBox.bottom = this.y + this.offsetY + ( this.height - margin );
    }
};
