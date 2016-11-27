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

const Ship    = require( "./Ship" );
const Powerup = require( "./Powerup" );

module.exports = class Player extends Ship {

    /**
     * @constructor
     * @param {Game} game
     * @param {number=} energy
     * @param {number=} weapon
     */
    constructor( game, energy, weapon ) {

        /* inherit prototype properties of Ship */

        energy = ( typeof energy === "number" ) ? energy : 10;
        weapon = ( typeof weapon === "number" ) ? weapon : 0;

        super( game, 0, 0, 0, 0, energy, weapon );
    }

    /**
     * @override
     * @public
     * @param {Object=} actor
     */
    hit( actor ) {

        if ( actor instanceof Powerup ) {
            if ( actor.type === 1 ) // powerup is of weapon type
                this.weapon = actor.value;
            actor.dispose();
        }
        else {
            super.hit( actor );
        }
    }
};
