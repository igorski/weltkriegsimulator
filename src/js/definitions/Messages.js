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
"use strict";

module.exports = {

    /* Game state changes */

    GAME_STARTED          : "G01",
    GAME_OVER             : "G02",
    ACTOR_ADDED           : "G03", // payload is newly added Actor
    ACTOR_REMOVED         : "G04", // payload is Actor to remove
    ACTOR_LAYER_SWITCH    : "G05", // payload is Actor that has switched layers
    FIRE_BULLET           : "G06", // payload is single Object or Array of: { x: number, y:number, xSpeed: number, ySpeed: number, layer: number }
    PLAYER_HIT            : "G07", // payload is { player: Player, object: Actor }
    UPDATE_SCORE          : "G08", // payload is numerical value of new score
    SHOW_MUSIC            : "G09", // payload is { title: string, author: string }
    SHOW_TITLE_SCREEN     : "G10",
    SHOW_HOW_TO_PLAY      : "G11"
};
