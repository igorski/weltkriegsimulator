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

const Pubsub = require( "pubsub-js" );
const Messages = require( "../../definitions/Messages" );
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
         * 0 = top, 1 = bottom
         *
         * @public
         * @type {number}
         */
        this.layer = ( typeof layer === "number" ) ? layer : 0;

        /**
         * @public
         * @type {number}
         */
        this.energy = 1;

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

        /**
         * @public
         * @type {number}
         */
        this.x = ( typeof x === "number" ) ? x : 0;

        /**
         * @public
         * @type {number}
         */
        this.y = ( typeof y === "number" ) ? y : 0;

        /**
         * @public
         * @type {number}
         */
        this.weapon = 0;

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
         * @public
         * @type {ShipRenderer}
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
    }
    
    /* public methods */
    
    /**
     * @public
     */
    update() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }
    
    /**
     * @public
     * @param {Object=} actor optional Actor to collide with, if null
     *        hit is presumed to be fatal, Actor energy depletes
     */
    hit( actor ) {
    
        const targetEnergy = ( actor && actor.damage ) ? this.energy - actor.damage : 0;
        this.energy = Math.max( 0, targetEnergy );
    }
    
    /**
     * @public
     */
    switchLayer() {

        if ( this.switching )
            return;

        const self = this;
        self.switching = true;
        const targetLayer = ( self.layer === 0 ) ? 1 : 0;

        ActorUtil.setDelayed( self, "layer", targetLayer, 1, () => {
            self.layer = targetLayer; // overcome JS rounding errors
            self.switching = false;
            self.game.updateActorLayer( self );
        }, Cubic.easeOut );
    }

    /**
     * Invoke whenever Actor is no longer part of the Game
     *
     * @public
     */
    dispose() {

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
};
