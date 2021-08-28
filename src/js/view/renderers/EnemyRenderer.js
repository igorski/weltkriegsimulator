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
import ShipRenderer from "./ShipRenderer";
import Config       from "@/config/Config";
import Enemy        from "@/model/actors/Enemy";
import Assets       from "@/definitions/Assets";

export default class EnemyRenderer extends ShipRenderer
{
    /**
     * a renderer that represents the Ship actor on screen
     *
     * @constructor
     * @param {Enemy} enemy
     * @param {RenderController} renderController
     */
    constructor( enemy, renderController ) {
        super( enemy, renderController );
        this.canRumble = false;
    }


    /* public methods */

    /**
     * @public
     */
    setSheetForEnemy() {
        this.switchAnimation( this.actor.type );
    }
}
