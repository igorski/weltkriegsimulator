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

const Random = require( "../util/Random" );

/**
 * list of actions
 *
 * "fn" describes the function to execute
 * "timeout" describes the timeout in milliseconds until
 * the next action in the list should be called
 *
 * @type {Array.<{fn: Function, timeout: number}>}
 */
const ACTION_LIST = [
    { fn: generateWave1, timeout: 5000 },
    { fn: createPowerup, timeout: 2500 },
    { fn: generateWave2, timeout: 7500 }
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
     * award points to the player for the kill of given Enemy
     *
     * @param {Player} player
     * @param {Enemy} enemy
     */
    awardPoints( player, enemy ) {
        // TODO: Award more points depending on enemy type/weapon class/etc.
        player.score += 100;
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
    // always generate enemy on same layer as the players current layer
    const targetLayer = gameModel.player.layer;

    for ( let i = 0, total = 5; i < total; ++i ) {

        const x      = ( gameModel.world.width / total ) * i;
        const y      = -( 100 + i * 50 );
        const xSpeed = 0;
        const ySpeed = 1 + ( i *.25 );

        gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer );
    }
}

function generateWave2( gameModel ) {
    generateWave1( gameModel ); // generate first squadron

    // squadron 2 at random target layers

    const type = Random.range( 1, 3 );

    for ( let i = 0, total = Random.range( 2, 10 ); i < total; ++i ) {

        const x      = ( gameModel.world.width / total ) * i;
        const y      = -( gameModel.world.height + 100 + i * 50 );
        const xSpeed = 0;
        const ySpeed = 1 + ( i * .25 );
        const targetLayer = Random.bool() ? 1 : 0;
        const energy = Random.bool() ? 1 : 2;

        gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer, energy, 0 ,type );
    }
}

function createPowerup( gameModel ) {
    // always generate power up on other layer than the players current layer
    const targetLayer = ( gameModel.player.layer === 1 ) ? 0 : 1;
    gameModel.createPowerup(
        Math.round( Math.random() * gameModel.world.width ), -50,
        0, 1, targetLayer, 1, 1
    );
}
