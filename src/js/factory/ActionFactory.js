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
import Random        from "@/util/Random";
import Enemies       from "@/definitions/Enemies";
import Patterns      from "@/definitions/Patterns";
import Weapons       from "@/definitions/Weapons";
import Boss          from "@/model/actors/Boss";
import ShipRenderer  from "@/view/renderers/ShipRenderer";
import { calculateSquadronWidth } from "@/util/ActorUtil";
import WeaponFactory from "./WeaponFactory";

/**
 * list of actions that enqueue the enemy squadrons, powerups,
 * bosses as well as other incrementally increasing magic
 *
 * "fn" describes the function to execute
 * "timeout" describes the timeout (in seconds) until
 * the next action in the list should be called
 *
 * @type {Array<{fn: Function, timeout: number}>}
 */
const ACTION_LIST = [
    // LEVEL ACTIONS

    { fn: generateHorizontalWave,    timeout: 5 },
    { fn: generateHorizontalWave,    timeout: 8 },
    { fn: generateWideSineSquadron,  timeout: 7.5 },
    { fn: createPowerup,             timeout: 3 },
    { fn: generateSidewaysSquadron,  timeout: 5 },
    { fn: generateWideSineSquadron,  timeout: 5 },
    { fn: generateMine,              timeout: 2 },
    { fn: generateSingle,            timeout: 2 },
    { fn: createWeapon,              timeout: 1 },
    { fn: generateHorizontalWave,    timeout: 3 },
    { fn: generateSingle,            timeout: 2 },
    { fn: generateSidewaysSquadron,  timeout: 5 },
    { fn: generateHorizontalWave,    timeout: 3 },
    { fn: generateSingle,            timeout: 1 },
    { fn: generateMine,              timeout: 1 },
    { fn: createEnergyPowerUp,       timeout: 5 },    // energy before boss

    // BOSS FIGHT

    { fn: generateBoss,              timeout: 2.5 },
    { fn: createWeapon,              timeout: 15 },   // helping weapon some time into the boss fight
    { fn: createPowerup,             timeout: 2 },
    { fn: createPowerup,             timeout: 4 },
    { fn: generateMine,              timeout: 5 },    // adding some additional annoyances during the fight
    { fn: createWeapon,              timeout: 15 },
    { fn: createEnergyPowerUp,       timeout: 15 },

    // E.O. list (when Boss is killed GameController will reset the action queue)
    { fn: () => true }
];
let gameModel, queuedAction;

export default {

    /**
     * execute the enqueued action
     *
     * @public
     * @param {Game} gameModelRef
     * @return {number} time (in milliseconds) to next action
     */
    execute( gameModelRef ) {
        gameModel = gameModelRef;
        queuedAction.fn( gameModel );

        // proceed to next action

        let nextActionIndex = ACTION_LIST.indexOf( queuedAction ) + 1;
        if ( nextActionIndex >= ACTION_LIST.length ) {
            // or first one in list if we have completed one round
            nextActionIndex = 0;
        }
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
        let points;

        if ( enemy instanceof Boss )
            points = 25000 + ( 25000 * gameModel.level );
        else
            points = (( enemy.type + 1 ) * 100 ) + ( enemy.weapon * 100 ) + ( enemy.pattern * 500 );

        player.score += points;
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

/* internal methods */

function generateHorizontalWave( gameModel ) {
    // always generate enemy on same layer as the players current layer
    const targetLayer = gameModel.player.layer;

    const total = Random.byLevel( 5, gameModel.level, 2 );
    const { width, xOffset } = calculateSquadronWidth( gameModel, total );

    for ( let i = 0; i < total; ++i ) {
        const x      = xOffset + (( width / total ) * i );
        const y      = -( 100 + i * 50 );
        const xSpeed = 0;
        const ySpeed = 1 + ( i *.25 );

        gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer );
    }
}

function generateWideSineSquadron( gameModel ) {

    // squadron 2 at random target layers and using behaviours
    const type     = Random.range( Enemies.SQUADRON_TYPE_1, Enemies.SQUADRON_TYPE_3 );
    const pattern  = Patterns.WIDE_SINE;
    const tileSize = 64;

    const total = Random.byLevel( 3, gameModel.level, 2 );
    const { width, xOffset } = calculateSquadronWidth( gameModel, total );

    for ( let i = 0; i < total; ++i ) {
        const x           = xOffset + (( width / 2 ) - tileSize / 2 );
        const y           = -( i * ( tileSize * 4 ));
        const ySpeed      = 1 + ( i * .25 );
        const targetLayer = Random.bool() ? 1 : 0;
        const energy      = Random.bool() ? 1 : 2;

        gameModel.createEnemy( x, y, 0, ySpeed, targetLayer, energy, 0, type, pattern );
    }
}

function generateMine( gameModel ) {
    // always generate mines on same layer as the players current layer
    const targetLayer = gameModel.player.layer;

    for ( let i = 0, total = Random.byLevel( 2, gameModel.level, 1 ); i < total; ++i ) {

        // mine is spread horizontally across the world
        const x      = ( gameModel.world.width / total ) * i;
        const y      = -( 100 + i * 100 );
        const xSpeed = 0;
        const ySpeed = 1;

        gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer, 1, Weapons.SPRAY, Enemies.MINE );
    }
}

function generateSingle( gameModel ) {
    // always generate mines on same layer as the players current layer
    const targetLayer = gameModel.player.layer;

    const type   = Random.range( Enemies.ALIEN, Enemies.FREIGHTER );
    const x      = Random.range( ShipRenderer.TILE_SIZE.width, gameModel.world.width - ShipRenderer.TILE_SIZE.width );
    const y      = -64;
    const xSpeed = 0;
    const ySpeed = 1;

    gameModel.createEnemy( x, y, xSpeed, ySpeed, targetLayer, 1, Weapons.LASER, type );
}

function generateSidewaysSquadron( gameModel ) {

    // squadron 2 at random target layers and using behaviours
    const type     = Random.range( Enemies.SQUADRON_TYPE_1, Enemies.SQUADRON_TYPE_3 );
    const pattern  = Patterns.SIDEWAYS_CUBE;
    const tileSize = ShipRenderer.TILE_SIZE.width;

    for ( let i = 0, total = Random.byLevel( 4, gameModel.level, 2 ); i < total; ++i ) {
        const y           = -( i * ( tileSize * 3 ));
        const ySpeed      = 1 + ( i * .25 );
        const targetLayer = Random.bool() ? 1 : 0;
        const energy      = Random.bool() ? 1 : 2;

        gameModel.createEnemy( 0, y, 0, ySpeed, targetLayer, energy, 0, type, pattern );
    }
}

function generateBoss( gameModel, optLevel = gameModel.level ) {
    const energy = Random.byLevel( 250, optLevel, 100 );
    const layer  = 1; // always appears on top (can switch layers during battle)
    const type   = optLevel % 5; // 5 types available in total (see spritesheet)
    gameModel.createBoss( 0, 0.5, layer, energy, type );
}

function createPowerup( gameModel, optType ) {
    // always generate power up on other layer than the players current layer
    const targetLayer = ( gameModel.player.layer === 1 ) ? 0 : 1;
    const powerupType = ( typeof optType === "number" ) ? optType : Random.range( 0, 2 );
    let powerupValue;
    switch ( powerupType ) {
        // energy
        default:
            powerupValue = Random.range( 2, 2 + ( gameModel.level ));
            break;
        // weapon
        case 1:
            powerupValue = WeaponFactory.createRandomWeapon( 1 );
            break;
        // score
        case 2:
            powerupValue = 1000 + ( gameModel.level * 250 );
            break;
    }

    gameModel.createPowerup(
        Math.round( Math.random() * gameModel.world.width ), -50,
        0, 1, targetLayer, powerupType, powerupValue
    );
}

function createWeapon( gameModel ) {
    createPowerup( gameModel, 1 );
}

function createEnergyPowerUp( gameModel ) {
    createPowerup( gameModel, 0 );
}

// DEBUG helpers
if ( process.env.NODE_ENV === "development" ) {
    window.boss    = ( optLevel ) => generateBoss( WKS.models.gameModel, optLevel );
    window.enemy   = () => generateSingle( WKS.models.gameModel );
    window.powerUp = () => createEnergyPowerUp( WKS.models.gameModel );
    window.weapon  = () => createWeapon( WKS.models.gameModel );
}
