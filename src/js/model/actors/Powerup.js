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

class Powerup extends Actor {

    /**
     * @constructor
     *
     * @param {Game} game
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number=} type powerup type (see enumeration)
     * @param {number=} value powerup value (see enumeration)
     */
    constructor( game, x, y, xSpeed, ySpeed, type, value ) {

        /* inherit prototype properties of Actor */

        super( game, x, y, xSpeed, ySpeed );

        /* instance properties */

        /**
         * @public
         * @type {number}
         */
        this.type = ( typeof type === "number" )  ? type : 0;

        /**
         * @public
         * @type {number}
         */
        this.value = ( typeof value === "number" )  ? value : 0;

        /* initialization */

        this.width  = this.orgWidth  =
        this.height = this.orgHeight = 48;
    }
};
export default Powerup;
