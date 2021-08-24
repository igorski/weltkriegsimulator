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
import ActorRenderer from "./ActorRenderer";
import Config        from "@/config/Config";
import Powerup       from "@/model/actors/Powerup";
import Assets        from "@/definitions/Assets";

export default class PowerupRenderer extends ActorRenderer
{
    /**
     * a renderer that represents the Powerup actor on screen
     *
     * @constructor
     * @param {Powerup} powerup
     * @param {RenderController} renderController
     */
    constructor( powerup, renderController ) {
        super( powerup, renderController );

        this.setBitmap( Assets.GRAPHICS.POWERUP.img );
        this.setSheet([
                // energy
                { row: 0, col: 0, fpt: 1, amount: 1 },
                // bullet spray
                { row: 0, col: 1, fpt: 1, amount: 1 },
                // score
                { row: 0, col: 2, fpt: 1, amount: 1 }
            ],
            64, 64
        );
        this.setSheetForPowerup();
    }


    /* public methods */

    /**
     * @public
     */
    setSheetForPowerup() {
        let animation = 0;

        switch ( /** @type {Powerup} */ ( this.actor ).type ) {
            default:
                break;
            case 1:
                animation = 1;
                break;
            case 2:
                animation = 2;
                break;
        }
        this.switchAnimation( animation );
    }
}
