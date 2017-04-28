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

const ACTION_LIST = [
    { fn: generateWave1, timeout: 2500 },
    { fn: createPowerup, timeout: 10000 }
];
let queuedAction;

module.exports = {

    /**
     * execute the enqueued action
     *
     * @public
     * @param {Game} gameModel
     * @return {number} time (in milliseconds) to next action
     */
    execute( gameModel ) {

        queuedAction.fn( gameModel );

        // proceed to next action (or first one in list)
        // TODO when going back to beginning of list, increase
        // game speed/difficulty ?

        let nextActionIndex = ACTION_LIST.indexOf( queuedAction ) + 1;
        if ( nextActionIndex >= ACTION_LIST.length )
            nextActionIndex = 0;

        queuedAction = ACTION_LIST[ nextActionIndex ];
        return queuedAction.timeout;
    },

    /**
     * @public
     * @return {number} time (in milliseconds to next action)
     */
    reset() {
        queuedAction = ACTION_LIST[ 0 ];
        return queuedAction.timeout;
    }
};

/* private methods */

function generateWave1( gameModel ) {
    console.warn("TODO: generate enemies");
}

function createPowerup( gameModel ) {
    // always generate power up on other layer than the players current layer
    const targetLayer = ( gameModel.player.layer === 1 ) ? 0 : 1;
    gameModel.createPowerup(
        Math.round( Math.random() * gameModel.world.width ), 0,
        0, 1, targetLayer, 1, 1
    );
}
