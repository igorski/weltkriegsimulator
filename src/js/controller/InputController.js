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

const Messages  = require( "../definitions/Messages" );
const Pubsub    = require( "pubsub-js" );
const ActorUtil = require( "../util/ActorUtil" );
const Bullet    = require( "../model/actors/Bullet" );

const DEFAULT_BLOCKED = [ 8, 32, 37, 38, 39, 40 ];
let hasListeners = false,
    isFiring = false,
    blockDefaults = true;

const activeMovement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let gameModel, player;

const InputController = module.exports = {

    init( wks ) {

        gameModel = wks.gameModel;
        player = gameModel.player;

        if ( !hasListeners ) {
            window.addEventListener( "keydown",    handleKeyDown );
            window.addEventListener( "keyup",      handleKeyUp );

            // prevent page scrolling on touch devices/mouse wheel scrolls

            window.addEventListener( "touchmove",  preventDefault, { passive: false });
            window.addEventListener( "mousewheel", preventDefault );

            hasListeners = true;
        }
    },

    // player controls

    fire() {
        // as firing bullets triggers an expensive calculation, we proxy this onto
        // the next animationFrame so we calculate this only once per screen render
        if ( !isFiring ) {
            isFiring = true;
            Pubsub.publish( Messages.FIRE_BULLET, player );
            requestAnimationFrame( unsetFire );
        }
    },

    switchLayer() {
        player.switchLayer();
    },

    left( targetValue = -5 ) {
        if ( !activeMovement.left ) {
            activeMovement.left = true;
            ActorUtil.setDelayed( player, "xSpeed", targetValue, .5 );
        }
    },

    right( targetValue = 5 ) {
        if ( !activeMovement.right ) {
            activeMovement.right = true;
            ActorUtil.setDelayed( player, "xSpeed", targetValue, .5 );
        }
    },

    up( targetValue = -5 ) {
        if ( !activeMovement.up ) {
            activeMovement.up = true;
            ActorUtil.setDelayed( player, "ySpeed", targetValue, .5 );
        }
    },

    down( targetValue = 5 ) {
        if ( !activeMovement.down ) {
            activeMovement.down = true;
            ActorUtil.setDelayed( player, "ySpeed", targetValue, .5 );
        }
    },

    /**
     * cancels all horizontal movement
     * (reduces speed gradually to a stand still)
     */
    cancelHorizontal() {
        if ( activeMovement.left || activeMovement.right ) {
            activeMovement.left  =
            activeMovement.right = false;
            ActorUtil.setDelayed( player, "xSpeed", 0, .5 );
        }
    },

    /**
     * cancels all vertical movement
     * (reduces speed gradually to a stand still)
     */
    cancelVertical() {
        if ( activeMovement.up || activeMovement.down ) {
            activeMovement.up   =
            activeMovement.down = false;
            ActorUtil.setDelayed( player, "ySpeed", 0, .5 );
        }
    }
};

/* private handlers */

function handleKeyDown( aEvent ) {

    const keyCode = aEvent.keyCode;

    // prevent defaults when using the arrows, space (prevents page jumps) and backspace (navigate back in history)

    if ( blockDefaults && DEFAULT_BLOCKED.indexOf( keyCode ) > -1 )
        aEvent.preventDefault();

    if ( gameModel.active ) {

        switch ( keyCode ) {

            case 27: // escape
                // TODO / QQQ:   temporary
                const Enemy = require( "../model/actors/Actor" );
                Pubsub.publish(
                    Messages.FIRE_BULLET, new Enemy( null, player.x, 0, 0, 0, player.layer )
                );
                break;

            case 32: // spacebar
                InputController.fire();
                break;

            case 38: // up
                InputController.up();
                break;

            case 40: // down
                InputController.down();
                break;

            case 39: // right
                InputController.right();
                break;

            case 37: // left
                InputController.left();
                break;

            case 13: // enter
                InputController.switchLayer();
                break;
        }
   }
}

function handleKeyUp( aEvent ) {

    switch ( aEvent.keyCode ) {
        case 38: // up
        case 40: // down
            InputController.cancelVertical();
            break;

        case 39: // right
        case 37: // left
            InputController.cancelHorizontal();
            break;
    }
}

function preventDefault( event ) {
    event.preventDefault();
}

function unsetFire() {
    isFiring = false;
}
