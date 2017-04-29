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

const Pubsub   = require( "pubsub-js" );
const Messages = require( "../definitions/Messages" );
const Actor    = require( "./actors/Actor" );
const Ship     = require( "./actors/Ship" );
const Player   = require( "./actors/Player" );
const Enemy    = require( "./actors/Enemy" );
const Bullet   = require( "./actors/Bullet" );
const Powerup  = require( "./actors/Powerup" );

const Game = module.exports = {

    /**
     * @public
     * @type {Player}
     */
    player: null,

    /**
     * all other Actors apart from the player
     *
     * @public
     * @type {Array.<Actor>}
     */
    actors: [],

    /**
     * whether the game is currently active
     *
     * @public
     * @type {boolean}
     */
    active: false,

    /**
     * @public
     * @type {Object}
     */
    world: {
        width: 400,
        height: 400
    },

    /**
     * fire a Bullet from the Pool
     *
     * @public
     * @param {Actor} actor
     */
    fireBullet( actor ) {
        createBulletForActor( actor );
    },

    /**
     * create a powerup
     *
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number} layer
     * @param {number} type
     * @param {number} value
     */
    createPowerup( x, y, xSpeed, ySpeed, layer, type, value ) {

        const powerup = getActorFromPool( powerupPool, x, y, xSpeed, ySpeed, layer );
        if ( powerup ) {
            powerup.type = type;
            powerup.value = value;
            Game.addActor( powerup );
        }
    },

    /**
     * create an enemy
     *
     * @param {number} x
     * @param {number} y
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number} layer
     */
    createEnemy( x, y, xSpeed, ySpeed, layer ) {
        const enemy = getActorFromPool( enemyPool, x, y, xSpeed, ySpeed, layer );
        if ( enemy ) {
            Game.addActor( enemy );
            enemy.reset();
            enemy.energy = 1;
        }
    },

    /**
     * add Actor to the Game
     *
     * @param {Actor} actor
     */
    addActor( actor ) {

        Game.actors.push( actor );
        Pubsub.publish(
            Messages.ACTOR_ADDED, actor
        );
    },

    /**
     * remove Actor from the Game, this should always be
     * invoked form Actor.dispose() and never directly
     * note: Player always remains in Game
     *
     * @public
     * @param {Actor} actor
     */
    removeActor( actor ) {

        const index = Game.actors.indexOf( actor );
        if ( index !== -1 )
            Game.actors.splice( index, 1 );

        // return pooled Actors to their pool
        if ( actor instanceof Bullet )
            bulletPool.push( actor );

        else if ( actor instanceof Powerup )
            powerupPool.push( actor );

        else if ( actor instanceof Enemy )
            enemyPool.push( actor );

        Pubsub.publish(
            Messages.ACTOR_REMOVED, actor
        );
    },

    /**
     * invoked whenever an Actor has switched
     * and completed its layer switch
     *
     * @param {Actor} actor
     */
    updateActorLayer( actor ) {
        Pubsub.publish(
            Messages.ACTOR_LAYER_SWITCH, actor
        )
    },

    /**
     * update all Actors for the next iteration of the game cycle
     * this is in essence the game loop
     *
     * @public
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {

        const player      = Game.player,
              actors      = Game.actors,
              active      = Game.active,
              worldRight  = Game.world.width,
              worldBottom = Game.world.height;
        
        player.update( aTimestamp );

        let i = actors.length, actor;

        while ( i-- ) {
            actor = actors[ i ];
            actor.update( aTimestamp );

            // no collision detection if game is inactive

            if ( !active )
                continue;

            const actorX      = actor.x,
                  actorY      = actor.y,
                  actorWidth  = actor.width,
                  actorHeight = actor.height;

            // if Actors y position exceeds the bottom of the worlds viewport,
            // dispose the Actor (it will be returned to the pool)

            if ( actor !== player && actorY > worldBottom ) {
                actor.dispose();
                continue;
            }

            // bullets are also disposed when they are out of horizontal
            // or top vertical bounds (this allows other Actors to come into
            // view slowly from out of visual bounds)

            if ( actor instanceof Bullet &&
                 actorY + actorHeight < 0 || actorX + actorWidth < 0 || actorX > worldRight ) {
                actor.dispose();
                continue;
            }

            // resolve collisions with other Actors in its vicinity
            // TODO: is it cheaper to check with all other actors
            // rather than to create a new unique Array per Actor in this loop ??
            const others = getActorsUnderPoint( actorX, actorY, actorWidth, actorHeight );

            others.forEach(( other ) => {
                if ( actor.collides( other )) {
                    actor.hit( other );
                    if ( actor instanceof Player || other instanceof Player ) {
                        Pubsub.publish( Messages.PLAYER_HIT, {
                            player: player, object: ( other !== player ) ? other : actor
                        });
                        if ( player.energy === 0 )
                            Pubsub.publish( Messages.GAME_OVER );
                    }
                }
            });
        }
    }
};

/* initialize Pools for commonly (re)used Actors */

Game.player = new Player( Game );
Game.addActor( Game.player ); // always in the list

const bulletPool  = new Array( 100 );
const enemyPool   = new Array( 20 );
const powerupPool = new Array( 5 );

[[ bulletPool, Bullet ], [ powerupPool, Powerup ], [ enemyPool, Enemy ]].forEach(( poolObject ) => {

    const pool = poolObject[ 0 ], ActorType = poolObject[ 1 ];
    for ( let i = 0; i < pool.length; ++i ) {
        const actor = new ActorType( Game );
        actor.pooled = true;
        pool[ i ] = actor;
    }
});

/**
 * retrieve an Actor from one of the pools and apply given
 * properties onto the Actor
 *
 * @private
 * @param {Array.<Actor>} pool
 * @param {number} x
 * @param {number} y
 * @param {number} xSpeed
 * @param {number} ySpeed
 * @param {number} layer
 * @return {Actor}
 */
function getActorFromPool( pool, x, y, xSpeed, ySpeed, layer ) {

    const actor = pool.shift();

    if ( actor ) {
        actor.x      = x;
        actor.y      = y;
        actor.xSpeed = xSpeed;
        actor.ySpeed = ySpeed;

        // if requested layer is different to old layer, switch it

        const targetLayer = Math.round( layer );

        if ( actor.layer !== targetLayer )
            actor.switchLayer( 0 );
    }
    return actor;
}

function createBulletForActor( actor ) {

    let bullets = [], bullet;

    switch ( actor.weapon ) {

        default:
        case 0:
            // single Bullet fire
            const y = ( actor instanceof Player ) ? actor.y + actor.offsetY - 10 : actor.y + actor.offsetY + actor.height;
            bullet = getActorFromPool(
                bulletPool,
                actor.x + actor.offsetX + ( actor.width * .5 ) - 5, // -5 to subtract half Bullet width
                y,
                0,
                ( actor instanceof Player ) ? -5 : 5, // Player shoots up, enemies shoot down
                actor.layer
            );
            if ( bullet )
                bullets.push( bullet );
            break;

        case 1:
            // spray Bullets
            const isTopLayer = ( actor.layer === 0 );
            const w = ( !isTopLayer ) ? actor.width  * .5 : actor.width  * .5;
            const h = ( !isTopLayer ) ? actor.height * .5 : actor.height * .5;
            let angle, pos, targetPos;

            for ( let i = 0, total = 16; i < total; ++i ) {

                const orgX = actor.x + actor.offsetX + w;
                const orgY = actor.y + actor.offsetY + h;

                angle = ( 360 / total ) * i;
                pos = calcPosition( orgX, orgY, ( isTopLayer ) ? actor.width * 2 : actor.width, angle );
                bullet = getActorFromPool( bulletPool, pos.x, pos.y, 0, 0, actor.layer );

                if ( !bullet )
                    break; // ran out of available bullets :(

                bullets.push( bullet );

                targetPos = calcPosition( orgX, orgY, Game.world.width + ( w * 2 ), angle );

                // we don't supply an xSpeed and ySpeed to the Bullet but use the
                // Tweening engine to update the Bullet position
                TweenMax.to( bullet, 1, { x: targetPos.x, y: targetPos.y, ease: Cubic.easeOut });
            }
            break;
    }
    for ( bullet of bullets )
        Game.addActor( bullet );
}

// helper function to calculate x, y coordinate within a circular pattern

function calcPosition( originX, originY, radius, angle ) {
    return {
        x: originX + radius * Math.cos( angle * Math.PI / 180 ),
        y: originY + radius * Math.sin( angle * Math.PI / 180 )
    }
}

function getActorsUnderPoint( x, y, width, height ) {

    const out = [];
    let i = Game.actors.length, theActor, actorX, actorY, actorWidth, actorHeight;

    while ( i-- ) {

        theActor = Game.actors[ i ];

        actorX      = theActor.x;
        actorY      = theActor.y;
        actorWidth  = theActor.width;
        actorHeight = theActor.height;

        if ( actorX < x + width  && actorX + actorWidth  > x &&
             actorY < y + height && actorY + actorHeight > y ) {
            out.push( theActor );
        }
    }
    return out;
}
