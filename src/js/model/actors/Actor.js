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
        this.width = 25;

        /**
         * @public
         * @type {number}
         */
        this.height = 25;

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

        /* initialization */

        // the dimensions this Actor occupies at the highest layer (1)

        this.orgWidth  = this.width;
        this.orgHeight = this.height;
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
     * @param {Object=} actor optional Actor to collide with
     */
    hit( actor ) {
    
        // extend in inheriting classes
    }
    
    /**
     * @public
     */
    switchLayer() {

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

        ActorUtil.setDelayed( self,
            [ "layer", "x", "y", "width", "height" ],
            [
                targetLayer, this.x + (( this.width * .5 ) - ( width * .5 )),
                this.y + (( this.width * .5 ) - ( height * .5 )),
                width, height
            ],
            1, () => {
                self.layer = targetLayer; // overcome JS rounding errors
                self.switching = false;
                self.game.updateActorLayer( self );
            },
            Cubic.easeOut
        );
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
