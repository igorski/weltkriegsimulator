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
import Assets from "@/definitions/Assets";

export default class BulletRenderer extends ActorRenderer
{
    /**
     * a renderer that represents the Ship actor on screen
     *
     * @constructor
     * @param {Ship} bullet
     * @param {RenderController} renderController
     */
    constructor( bullet, renderController ) {
        super( bullet, renderController );
        this.setResource( Assets.GRAPHICS.BULLET.id );
    }


    /* public methods */

    /**
     * @override
     * @param {IRenderer} renderer
     */
    draw( renderer ) {

        // you could consider fillRect w/ fillStyle white but profiling shows
        // that drawImage is orders of magnitude faster !!

        switch ( this.actor.layer ) {
            default:
                renderer.drawImage(
                    this._resourceId, this._bounds.left, this._bounds.top
                );
                break;

            case 0:
                renderer.drawImage(
                    this._resourceId, this._bounds.left, this._bounds.top, 5, 5
                );
                break;
        }
    }
}
