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
const Actions  = require( "../actions/Actions" );
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
     * handle a direct hit from a Bullet with a Ship
     *
     * @param {Bullet} bullet
     * @param {Ship} ship
     */
    onBulletHit( bullet, ship ) {
        ship.energy = Math.max( 0, ship.energy - bullet.damage );
        bullet.dispose(); // Bullets disappear on impact

        if ( bullet.owner === Game.player ) {
            Actions.awardPoints( Game.player, /** @type {Enemy} */ ( ship ));
            Pubsub.publish( Messages.UPDATE_SCORE, Game.player.score );
        }
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
     * @param {number=} optEnergy
     * @param {number=} optWeapon
     */
    createEnemy( x, y, xSpeed, ySpeed, layer, optEnergy = 1, optWeapon = 0 ) {
        const enemy = getActorFromPool( enemyPool, x, y, xSpeed, ySpeed, layer );
        if ( enemy ) {
            Game.addActor( enemy );
            enemy.reset();
            enemy.energy = optEnergy;
            enemy.weapon = optWeapon;
        }
    },

    /**
     * add Actor to the Game
     *
     * @param {Actor} actor
     */
    addActor( actor ) {

        if ( Game.actors.indexOf( actor ) > -1 )
            return;

        Game.actors.push( actor );
        Pubsub.publish(
            Messages.ACTOR_ADDED, actor
        );
    },

    /**
     * remove Actor from the Game, this should always be
     * invoked form Actor.dispose() and never directly
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

            if ( actor instanceof Bullet ) {
                // is Bullet out of horizontal bounds?
                if ( actorX + actorWidth < 0 || actorX > worldRight ||
                    // note we allow Bullets to exist below the world top
                    // for Enemies (they start shooting when still out of sight, these
                    // Bullets should be allowed to travel downwards towards the player)
                    ( actor.owner === player && actorY + actorHeight < 0 )) {
                    actor.dispose();
                    continue;
                }
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
                        // are we still alive?
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
 * properties onto the Actor, this function also resets previously
 * used (and disposed) Actors
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

        // ready for next iteration!
        actor.disposed = false;
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

            const orgX = actor.x + actor.offsetX + ( actor.width  * .5 );
            const orgY = actor.y + actor.offsetY + ( actor.height * .5 );
            const sprayRadius = Game.world.width + actor.width;
            let angle, pos, targetPos;

            for ( let i = 0, total = 16, max = total - 1; i < total; ++i ) {

                angle  = ( 360 / total ) * i;
                pos    = calcPosition( orgX, orgY, actor.width, angle );
                bullet = getActorFromPool( bulletPool, pos.x, pos.y, 0, 0, actor.layer );

                if ( !bullet )
                    break; // ran out of available bullets, FML right? :(

                bullets.push( bullet );

                // ensure no pending Tweens exist for the bullet
                TweenMax.killTweensOf( bullet );

                targetPos = calcPosition( orgX, orgY, sprayRadius, angle );

                // we don't supply an xSpeed and ySpeed to the Bullet but use the
                // Tweening engine to update the Bullet position, this also allows
                // for fancy easing functions

                const opts = { x: targetPos.x, y: targetPos.y, ease: Cubic.easeOut };

                // the last Tween will dispose all the Bullets (can get stuck on screen
                // edge during rapid movement / cancellation of pooled Tweens)
                if ( i === max )
                    opts.onComplete = () => bullets.forEach(( bullet ) => bullet.dispose() );

                TweenMax.to( bullet, 1, opts );
            }
            break;
    }
    for ( bullet of bullets ) {
        bullet.owner = actor;
        Game.addActor( bullet );
    }
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
