/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016 - http://www.igorski.nl
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

const Pubsub    = require( "pubsub-js" );
const Messages  = require( "../definitions/Messages" );
const ActorUtil = require( "../util/ActorUtil" );
const Bullet    = require( "../model/actors/Bullet" );

const DEFAULT_BLOCKED = [ 8, 32, 37, 38, 39, 40 ];
let hasListeners = false,
    shiftDown = false,
    optionDown = false,
    blockDefaults = true,
    suspended = false;

const activeMovement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let gameModel, player, listener;

const InputController = module.exports = {

    init( game ) {

        gameModel = game.gameModel;
        player = gameModel.player;

        if ( !hasListeners ) {
            window.addEventListener( "keydown", handleKeyDown );
            window.addEventListener( "keyup",   handleKeyUp );

            hasListeners = true;
        }
    },

    /**
     * whether the Apple option or a control key is
     * currently held down for the given event
     *
     * @param {Event} aEvent
     * @returns {boolean}
     */
    hasOption( aEvent ){
        return ( optionDown === true ) || aEvent.ctrlKey;
    },

    /**
     * whether the shift key is currently held down
     *
     * @returns {boolean}
     */
    hasShift(){
        return ( shiftDown === true );
    }
};

/* private handlers */

function handleKeyDown( aEvent ) {

    if ( !suspended ) {
        const keyCode = aEvent.keyCode;

        shiftDown = !!aEvent.shiftKey;

        // prevent defaults when using the arrows, space (prevents page jumps) and backspace (navigate back in history)

        if ( blockDefaults && DEFAULT_BLOCKED.indexOf( keyCode ) > -1 )
            aEvent.preventDefault();

        if ( listener && listener.handleKey ) {
            listener.handleKey( "down", keyCode, aEvent );
        }
        else {
            switch ( keyCode ) {

                case 27: // escape
                    // TODO / QQQ:
                    const Enemy = require( "../model/actors/Actor" );
                    Pubsub.publish(
                        Messages.FIRE_BULLET, new Enemy( null, player.x, 0, 0, 0, player.layer )
                    );
                    break;

                case 32: // spacebar
                    Pubsub.publish(
                        Messages.FIRE_BULLET, player
                    );
                    break;

                // capture the apple key here as it is not recognized as a modifier

                case 224:   // Firefox
                case 17:    // Opera
                case 91:    // WebKit left key
                case 93:    // Webkit right key
                    optionDown = true;
                    break;

                case 38: // up

                    if ( !activeMovement.up ) {
                        activeMovement.up = true;
                        ActorUtil.setDelayed( player, "ySpeed", -5, .5 );
                    }
                    break;

                case 40: // down

                    if ( !activeMovement.down ) {
                        activeMovement.down = true;
                        ActorUtil.setDelayed( player, "ySpeed", 5, .5 );
                    }
                    break;

                case 39: // right

                    if ( !activeMovement.right ) {
                        activeMovement.right = true;
                        ActorUtil.setDelayed( player, "xSpeed", 5, .5 );
                    }
                    break;

                case 37: // left

                    if ( !activeMovement.left ) {
                        activeMovement.left = true;
                        ActorUtil.setDelayed( player, "xSpeed", -5, .5 );
                    }
                    break;

                case 13: // enter
                    player.switchLayer();
                    break;
            }
        }
   }
}

function handleKeyUp( aEvent ) {

    shiftDown = false;

    if ( optionDown ) {

        switch ( aEvent.keyCode ) {

            // Apple key
            case 224:   // Firefox
            case 17:    // Opera
            case 91:    // WebKit left key
            case 93:    // Webkit right key
                optionDown = false;
                break;
        }
    }
    else {
        switch ( aEvent.keyCode ) {
            case 38: // up
            case 40: // down
                if ( activeMovement.up || activeMovement.down ) {
                    activeMovement.up =
                    activeMovement.down = false;
                    ActorUtil.setDelayed( player, "ySpeed", 0, .5 );
                }
                break;

            case 39: // right
            case 37: // left
                if ( activeMovement.left || activeMovement.right ) {
                    activeMovement.left =
                    activeMovement.right = false;
                    ActorUtil.setDelayed( player, "xSpeed", 0, .5 );
                }
                break;
        }
    }
}
