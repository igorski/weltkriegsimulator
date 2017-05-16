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
"use strict";

const Config        = require( "../../config/Config" );
const Boss          = require( "../../model/actors/Boss" );
const ActorRenderer = require( "./ActorRenderer" );
const Assets        = require( "../../definitions/Assets" );

module.exports = BossRenderer;

/**
 * a renderer that represents the Ship actor on screen
 *
 * @constructor
 * @param {Boss} boss
 * @param {RenderController} renderController
 */
function BossRenderer( boss, renderController ) {

    BossRenderer.super( this, "constructor", boss, renderController );

    this.setBitmap( Assets.GRAPHICS.BOSS );
    this.setSheet([

            // Boss sprite (facing down)
            { row: 0, col: 0, fpt: 1, amount: 1 }
        ],
        BossRenderer.TILE_SIZE.width,
        BossRenderer.TILE_SIZE.height
    );
}
ActorRenderer.extend( BossRenderer );

/**
 * dimensions of each tile in the spritesheet
 *
 * @public
 * @type {{width: number, height: number}}
 */
BossRenderer.TILE_SIZE = { width: 128, height: 128 };
