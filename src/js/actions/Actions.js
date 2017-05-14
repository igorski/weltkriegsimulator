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
    { fn: generateHorizontalWave, timeout: 5000 },
    { fn: generateVerticalWave1,  timeout: 7500 },
    { fn: createPowerup,          timeout: 3000 },
    { fn: generateVerticalWave2,  timeout: 7500 },
    { fn: progressLevel,          timeout: 1000 }
];
let queuedAction;
// as time progresses, we increase the level of the game, we can
// use this as a multiplier for enemy properties or poewrups

let level = 0;

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
        // award points per defeated enemy type, their weapon and behaviour
        // (a way to calculate the "class" of the Enemy)
        player.score += ((( enemy.type + 1 ) * 100 ) + ( enemy.weapon * 100 ) + ( enemy.behaviour * 500 ));
    },

    /**
     * @public
     * @return {number} time (in milliseconds to next action)
     */
    reset() {
        queuedAction = ACTION_LIST[ 0 ];
        level        = 0;
        return queuedAction.timeout;
    }
};

/* private methods */

function generateHorizontalWave( gameModel ) {
    // always generate enemy on same layer as the players current layer
    const targetLayer = gameModel.player.layer;

    for ( let i = 0, total = 5; i < total; ++i ) {

        // wave 1 is spread horizontally across the screen
        const x      = ( gameModel.world.width / total ) * i;
        const y      = -( 100 + i * 50 );
        const xSpeed = 0;
        const ySpeed = 1 + ( i *.25 );

        gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer );
    }
}

function generateVerticalWave1( gameModel ) {

    // squadron 2 at random target layers and using behaviours
    const type      = Random.range( 1, 3 );
    const behaviour = 1;
    const tileSize  = 64;

    for ( let i = 0, total = Random.range( 2, 10 ); i < total; ++i ) {

        const x           = ( gameModel.world.width / 2 ) - tileSize / 2;
        const y           = -( i * ( tileSize * 4 ));
        const ySpeed      = 1 + ( i * .25 );
        const targetLayer = Random.bool() ? 1 : 0;
        const energy      = Random.bool() ? 1 : 2;

        gameModel.createEnemy( x, y, 0, ySpeed, targetLayer, energy, 0, type, behaviour );
    }
}
function generateVerticalWave2( gameModel ) {

    // squadron 2 at random target layers and using behaviours
    const type      = Random.range( 1, 3 );
    const behaviour = 2;
    const tileSize  = 64;

    for ( let i = 0, total = Random.range( 5, 15 ); i < total; ++i ) {

        const y           = -( i * ( tileSize * 3 ));
        const ySpeed      = 1 + ( i * .25 );
        const targetLayer = Random.bool() ? 1 : 0;
        const energy      = Random.bool() ? 1 : 2;

        gameModel.createEnemy( 0, y, 0, ySpeed, targetLayer, energy, 0, type, behaviour );
    }
}

function progressLevel() {
    // increase the level of the game
    ++level;
}

function createPowerup( gameModel ) {
    // always generate power up on other layer than the players current layer
    const targetLayer = ( gameModel.player.layer === 1 ) ? 0 : 1;
    const powerupType = Random.range( 0, 2 );
    let powerupValue;
    switch ( powerupType ) {
        // energy
        case 0:
            powerupValue = Random.range( 2, 2 + ( level ));
            break;
        // weapon
        case 1:
            powerupValue = 1;
            break;
        // score
        case 2:
            powerupValue = Random.range( 5000, 5000 + ( level * 5000 ));
            break;
    }

    gameModel.createPowerup(
        Math.round( Math.random() * gameModel.world.width ), -50,
        0, 1, targetLayer, powerupType, powerupValue
    );
}
