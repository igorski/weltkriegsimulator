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
import Pubsub          from "pubsub-js";
import gsap, { Cubic } from "gsap";
import Copy            from "@/definitions/Copy";
import Enemies         from "@/definitions/Enemies";
import Messages        from "@/definitions/Messages";
import Weapons         from "@/definitions/Weapons";
import ActionFactory   from "@/factory/ActionFactory";
import WeaponFactory   from "@/factory/WeaponFactory";
import Actor           from "./actors/Actor";
import Ship            from "./actors/Ship";
import Player          from "./actors/Player";
import Enemy           from "./actors/Enemy";
import Boss            from "./actors/Boss";
import Bullet          from "./actors/Bullet";
import Powerup         from "./actors/Powerup";

const { DEFAULT, LASER, SPRAY } = Weapons;
const DEG_TO_RAD = Math.PI / 180;

// class global variables for non-primitives used on update, fire and collision detection
// this prevents allocation within function scopes during game updates (which are frequent)
// that can lead to garbage collection taking up execution time
// be mindful of collisions when using functions within loops that consume these variables
let player,
    actors, actor,  // used by Game.update()
    pointActor,     // used by getActorsUnderPoint()
    pos, bullet,    // used by createBulletForActor()
    tween;          // used by disposeBulletsInTween()

const pointActors    = [];   // used by getActorsUnderPoint()
const bullets        = [];   // used by createBulletForActor()
const positionObject = {};   // uesd by calcPosition(), invoked via createBulletForActor()

const Game = {

    /**
     * @type {Player}
     */
    player: null,

    /**
     * all other Actors apart from the player
     *
     * @type {Array<Actor>}
     */
    actors: [],

    /**
     * whether the game is currently active
     *
     * @type {boolean}
     */
    active: false,

    /**
     * @type {Object}
     */
    world: {
        width  : 400,
        height : 400
    },

    // as time progresses, we increase the level of the game, we can
    // use this as a multiplier for enemy properties or power ups (see ActionFactory)

    level: 0,

    /**
     * fire a Bullet from the Pool
     *
     * @param {Actor} actor
     */
    fireBullet( actor ) {
        createBulletForActor( actor );
        Pubsub.publish( Messages.FIRE );
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

        Pubsub.publish( Messages.IMPACT );

        // if Bullet came from Player and Ship has died, award points :)

        if ( bullet.owner === Game.player && ship.energy === 0 ) {
            ActionFactory.awardPoints( Game.player, /** @type {Enemy} */ ( ship ));
            Pubsub.publish( Messages.UPDATE_SCORE, Game.player.score );
        }
    },

    /**
     * handle a direct collision between the Player and another Actor
     *
     * @param {Actor} actor
     */
    onPlayerHit( actor ) {
        player = Game.player;
        Pubsub.publish( Messages.PLAYER_HIT, { player, object: actor });
        Pubsub.publish( Messages.UPDATE_ENERGY, player );

        // are we still alive?
        if ( player.energy === 0 ) {
            Pubsub.publish( Messages.GAME_OVER );
            // broadcast game state to outside high score tracking applications
            const { name, score } = player;
            Pubsub.publish( Messages.GAME_ENDED, { name, score });
        }
    },

    /**
     * when Player touches a Powerup
     *
     * @param {Powerup} powerup
     */
    onPowerup( powerup ) {
        player = Game.player;
        const powerupValue = powerup.value;
        switch( powerup.type ) {
            // energy
            case 0:
                player.energy = Math.min( player.energy + powerupValue, player.maxEnergy );
                Pubsub.publish( Messages.UPDATE_ENERGY, player );
                Pubsub.publish( Messages.SHOW_MESSAGE, Copy.applyData( "ENERGY" ));
                break;

            // weapon
            case 1:
                WeaponFactory.applyToActor( powerupValue, player );
                player.setWeaponTimer(); // nothing lasts forever :)
                Pubsub.publish( Messages.SHOW_MESSAGE, { title: Copy.WEAPONS[ powerupValue ] });
                break;

            // score
            case 2:
                player.score += powerupValue;
                Pubsub.publish( Messages.UPDATE_SCORE, player.score );
                Pubsub.publish( Messages.SHOW_MESSAGE, Copy.applyData( "BONUS", powerupValue ));
                break;
        }
    },

    /**
     * when Boss is defeated by Player
     * @param {Boss} boss
     */
    onBossDeath( boss ) {
        ++Game.level;
        Pubsub.publish( Messages.BOSS_DEFEATED, boss );
        Pubsub.publish( Messages.SHOW_MESSAGE, Copy.applyData( "NEXT_LEVEL", ( Game.level + 1 )));
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
     * @param {number=} optType
     * @param {number=} optPattern
     */
    createEnemy( x, y, xSpeed, ySpeed, layer, optEnergy = 1, optWeapon = Weapons.DEFAULT, optType = Enemies.SQUADRON_TYPE_1, optPattern = 0 ) {
        const enemy = getActorFromPool( enemyPool, x, y, xSpeed, ySpeed, layer );
        if ( enemy ) {
            enemy.reset();
            enemy.type    = optType;
            enemy.energy  = optEnergy;
            enemy.pattern = optPattern;
            WeaponFactory.applyToActor( optWeapon, enemy );
            Game.addActor( enemy );
        }
    },

    /**
     * create a Boss
     *
     * @param {number} xSpeed
     * @param {number} ySpeed
     * @param {number} layer
     * @param {number=} optEnergy
     * @param {number=} optType
     */
    createBoss( xSpeed, ySpeed, layer, optEnergy = 1, optType = Enemies.BOSS_TYPE_1 ) {
        const boss = getActorFromPool( bossPool, 0, 0, xSpeed, ySpeed, layer );
        if ( boss ) {
            boss.reset();
            boss.energy = optEnergy;
            boss.type   = optType;
            boss.updateHitBox(); // different Boss types have different sizes
            boss.x = Game.world.width / 2 - boss.width / 2;
            boss.y = -boss.height;
            Game.addActor( boss );
        }
    },

    /**
     * add Actor to the Game
     *
     * @param {Actor} actor
     */
    addActor( actor ) {
        if ( Game.actors.indexOf( actor ) > -1 ) {
            return;
        }
        Game.actors.push( actor );
        Pubsub.publish(
            Messages.ACTOR_ADDED, actor
        );
    },

    /**
     * remove Actor from the Game, this should always be
     * invoked form Actor.dispose() and never directly
     *
     * @param {Actor} actor
     * @param {boolean=} optExplode whether to trigger explosion
     */
    removeActor( actor, optExplode ) {
        if ( optExplode === true ) {
            Pubsub.publish( Messages.ACTOR_EXPLODE, actor );
        }

        const index = Game.actors.indexOf( actor );
        if ( index !== -1 ) {
            Game.actors.splice( index, 1 );
        }

        // return pooled Actors to their pool
        if ( actor instanceof Bullet ) {
            bulletPool.push( actor );
        }
        else if ( actor instanceof Powerup ) {
            powerupPool.push( actor );
        }
        else if ( actor instanceof Boss ) {
            bossPool.push( actor );
        }
        else if ( actor instanceof Enemy ) {
            enemyPool.push( actor );
        }
        Pubsub.publish(
            Messages.ACTOR_REMOVED, actor
        );
    },

    /**
     * invoked whenever an Actor is about
     * to start switching layers
     *
     * @param {Actor} actor
     * @param {number} targetLayer
     */
    initiateActorLayerSwitch( actor, targetLayer ) {
        Pubsub.publish(
            Messages.ACTOR_LAYER_SWITCH_START, { actor: actor, layer: targetLayer }
        );
    },

    /**
     * invoked whenever an Actor has switched
     * and completed its layer switch
     *
     * @param {Actor} actor
     * @param {number} layer destination layer Actor switched to
     */
    completeActorLayerSwitch( actor, layer ) {
        Pubsub.publish(
            Messages.ACTOR_LAYER_SWITCH_COMPLETE, { actor, layer }
        );
    },

    /**
     * update all Actors for the next iteration of the game cycle
     * this is in essence the game loop
     *
     * @param {number} aTimestamp
     */
    update( aTimestamp ) {
        player = Game.player;
        actors = Game.actors;

        const active      = Game.active;
        const worldRight  = Game.world.width;
        const worldBottom = Game.world.height;

        let i = actors.length;

        while ( i-- ) {
            actor = actors[ i ];

            // could be spliced during update
            if ( !actor ) {
                continue;
            }
            actor.update( aTimestamp );
            actor.renderer?.update();

            // no collision detection if game is inactive

            if ( !active ) {
                continue;
            }

            // cache variables (indeed, `const { x, y, width, height } = actor;` works nicely
            // though Babels destructuring creates a local Object reference which requires garbage collection)
            const x      = actor.x;
            const y      = actor.y;
            const width  = actor.width;
            const height = actor.height;

            // if Actors y position exceeds the bottom of the worlds viewport,
            // dispose the Actor (it will be returned to the pool)

            if ( actor !== player && y > worldBottom ) {
                actor.dispose();
                continue;
            }

            // bullets are also disposed when they are out of horizontal
            // or top vertical bounds (this allows other Actors to come into
            // view slowly from out of visual bounds)

            if ( actor instanceof Bullet ) {
                // is Bullet out of horizontal bounds?
                if ( x + width < 0 || x > worldRight ||
                    // note we allow Bullets to exist below the world top
                    // for Enemies (they start shooting when still out of sight, these
                    // Bullets should be allowed to travel downwards towards the player)
                    ( actor.owner === player && y + height < 0 )) {
                    actor.dispose();
                }
                continue; // no collision detection for Bullets (is done on collidable Actors instead)
            }

            // resolve collisions with other Actors in the vicinity
            getActorsUnderPoint( x, y, width, height ); // populates pointActors
            for ( pointActor of pointActors ) {
                if ( actor.collides( pointActor )) {
                    actor.hit( pointActor );
                    if ( actor instanceof Player || pointActor instanceof Player ) {
                        Game.onPlayerHit(( pointActor !== player ) ? pointActor : actor );
                    }
                }
            }
        }
    },

    reset() {
        // remove Actors (reverse loop as Array will be updated on Actor.dispose())
        let i = Game.actors.length;
        while ( i-- ) {
            Game.actors[ i ].dispose();
        }
        const player = Game.player;
        player.reset();
        if ( player.layer !== 1 ) {
            player.switchLayer( 1 ); // ensure we are back at the upper layer
        }
        Game.addActor( player );
        Game.level  = 0;
        Game.active = true;
    }
};
export default Game;

/* initialize Pools for commonly (re)used Actors */

Game.player = new Player( Game );

const bulletPool  = new Array( 200 );
const enemyPool   = new Array( 20 );
const bossPool    = new Array( 1 );
const powerupPool = new Array( 5 );

[[ bulletPool, Bullet ], [ enemyPool, Enemy ], [ bossPool, Boss ], [ powerupPool, Powerup ]]
.forEach(([ pool, ActorType ]) => {
    for ( let i = 0; i < pool.length; ++i ) {
        actor        = new ActorType( Game );
        actor.pooled = true;
        pool[ i ]    = actor;
    }
});

/**
 * retrieve an Actor from one of the pools and apply given
 * properties onto the Actor, this function also resets previously
 * used (and disposed) Actors
 *
 * @private
 * @param {Array<Actor>} pool
 * @param {number} x
 * @param {number} y
 * @param {number} xSpeed
 * @param {number} ySpeed
 * @param {number} layer
 * @return {Actor}
 */
function getActorFromPool( pool, x, y, xSpeed, ySpeed, layer ) {
    const poolActor = pool.shift();
    if ( poolActor ) {
        poolActor.x      = x;
        poolActor.y      = y;
        poolActor.xSpeed = xSpeed;
        poolActor.ySpeed = ySpeed;

        // if requested layer is different to old layer, switch it

        const targetLayer = Math.round( layer );

        if ( poolActor.layer !== targetLayer ) {
            poolActor.switchLayer( 0 );
        }
        // ready for next iteration!
        poolActor.disposed = false;
    }
    return poolActor;
}

function createBulletForActor( actor ) {
    bullets.length = 0; // clears existing length without allocating new Array
    let bulletY;
    switch ( actor.weapon ) {
        default:
        case DEFAULT:
        case LASER:
            bulletY = ( actor instanceof Player ) ? actor.y + actor.offsetY - 10 : actor.y + actor.offsetY + actor.height;
            bullet = getActorFromPool(
                bulletPool,
                actor.x + actor.offsetX + ( actor.width * 0.5 ) - 5, // -5 to subtract half Bullet width
                bulletY,
                0,
                ( actor instanceof Player ) ? -5 : 5, // Player shoots up, enemies shoot down
                actor.layer
            );
            if ( bullet ) {
                bullets.push( bullet );
            }
            break;

        case SPRAY:
            bulletY       = actor.y + actor.offsetY + ( actor.height * 0.5 );
            const bulletX = actor.x + actor.offsetX + ( actor.width  * 0.5 );
            const radius  = Math.max( Game.world.width, Game.world.height ) + actor.width;

            for ( let i = 0, total = 16, max = total - 1; i < total; ++i ) {
                const angle = ( 360 / total ) * i;
                pos    = calcPosition( bulletX, bulletY, actor.width, angle );
                bullet = getActorFromPool( bulletPool, pos.x, pos.y, 0, 0, actor.layer );

                if ( !bullet ) {
                    break; // ran out of available bullets, FML right? :(
                }
                bullets.push( bullet );

                // ensure no pending Tweens exist for the bullet
                gsap.killTweensOf( bullet );

                pos = calcPosition( bulletX, bulletY, radius, angle );

                // we don't supply an xSpeed and ySpeed to the Bullet but use the
                // Tweening engine to update the Bullet position, this also allows
                // for fancy easing functions

                const opts = { x: pos.x, y: pos.y, ease: Cubic.easeOut };

                //if ( i === max ) { // optionally dispose on last bullet only ? needs cloned bullets list reference though...
                    opts.onComplete = disposeBulletsInTween;
                //}
                // NOTE: mines fire sprays much more slowly (but more frequently, see WeaponFactory)
                gsap.to( bullet, actor.type === Enemies.MINE ? 4 : 1, opts );
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
    positionObject.x = originX + radius * Math.cos( angle * DEG_TO_RAD );
    positionObject.y = originY + radius * Math.sin( angle * DEG_TO_RAD );
    return positionObject;
}

function getActorsUnderPoint( compareX, compareY, compareWidth, compareHeight ) {
    pointActors.length = 0; // clears existing length without allocating new Array
    let i = Game.actors.length;

    while ( i-- ) {
        pointActor = Game.actors[ i ];
        if ( pointActor.x < compareX + compareWidth  && pointActor.x + pointActor.width  > compareX &&
             pointActor.y < compareY + compareHeight && pointActor.y + pointActor.height > compareY ) {
            pointActors.push( pointActor );
        }
    }
}

function disposeBulletsInTween() {
    for ( tween of this._targets ) {    // "this" reference is GSAP Tween instance
        tween.dispose();                // "tween" is Bullet actor
    }
}
