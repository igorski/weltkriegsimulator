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
import Actor from "./Actor";

class Bullet extends Actor {

    /**
     * @constructor
     *
     * @param {Game} game
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number=} optDamage optional damage Bullet deals (defaults to 1)
     */
    constructor( game, x, y, xSpeed, ySpeed, optDamage ) {

        /* inherit prototype properties of Actor */

        super( game, x, y, xSpeed, ySpeed );

        /* instance properties */

        /**
         * the amount of damage a collision with this bullet deals
         *
         * @public
         * @type {number}
         */
        this.damage = ( typeof optDamage === "number" )  ? optDamage : 1;

        /**
         * reference to the Ship that fired this Bullet
         *
         * @public
         * @type {Ship}
         */
        this.owner = null;

        /* initialization */

        this.width  = this.orgWidth  =
        this.height = this.orgHeight = 10;
    }
};
export default Bullet;
