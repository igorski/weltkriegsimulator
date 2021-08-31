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
import gsap           from "gsap";
import Pubsub         from "pubsub-js";
import Messages       from "@/definitions/Messages";
import { setDelayed } from "@/util/ActorUtil";
import Bullet         from "@/model/actors/Bullet";
import EventHandler   from "@/util/EventHandler";

const DEFAULT_BLOCKED = [ 8, 32, 37, 38, 39, 40 ];
let blockDefaults = true, handler;

const PLAYER_SPEED = 5; // pixels per game tick

const activeMovement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let gameModel, player;

const InputController = {

    init( models ) {

        ({ gameModel } = models );
        player = gameModel.player;

        [
            Messages.GAME_START,
            Messages.GAME_OVER

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));
    },

    // player controls
    // the optional killExisting flags are for touch control (as moving from right to left
    // while keeping the finger pressed does not fire a new start/cancel/end event, meaning
    // we must track changes in direction during touchmove keeping cancellations in check)

    left( rampUpTime = 0.5, killExisting = false ) {
        if ( killExisting ) {
            activeMovement.left  =
            activeMovement.right = false;
            gsap.killTweensOf( player, "xSpeed" );
        }
        if ( !activeMovement.left ) {
            activeMovement.left = true;
            setDelayed( player, "xSpeed", -PLAYER_SPEED, rampUpTime );
        }
    },

    right( rampUpTime = 0.5, killExisting = false ) {
        if ( killExisting ) {
            activeMovement.left  =
            activeMovement.right = false;
            gsap.killTweensOf( player, "xSpeed" );
        }
        if ( !activeMovement.right ) {
            activeMovement.right = true;
            setDelayed( player, "xSpeed", PLAYER_SPEED, rampUpTime );
        }
    },

    up( rampUpTime = 0.5, killExisting = false ) {
        if ( killExisting ) {
            activeMovement.up   =
            activeMovement.down = false;
            gsap.killTweensOf( player, "ySpeed" );
        }
        if ( !activeMovement.up ) {
            activeMovement.up = true;
            setDelayed( player, "ySpeed", -PLAYER_SPEED, rampUpTime );
        }
    },

    down( rampUpTime = 0.5, killExisting = false ) {
        if ( killExisting ) {
            activeMovement.up   =
            activeMovement.down = false;
            gsap.killTweensOf( player, "ySpeed" );
        }
        if ( !activeMovement.down ) {
            activeMovement.down = true;
            setDelayed( player, "ySpeed", PLAYER_SPEED, rampUpTime );
        }
    },

    /**
     * cancels all horizontal movement
     * (reduces speed gradually to a stand still)
     */
    cancelHorizontal() {
        activeMovement.left  =
        activeMovement.right = false;

        if ( player.xSpeed !== 0 ) {
            gsap.killTweensOf( player, "xSpeed" );
            setDelayed( player, "xSpeed", 0, 0.5 );
        }
    },

    /**
     * cancels all vertical movement
     * (reduces speed gradually to a stand still)
     */
    cancelVertical() {
        activeMovement.up   =
        activeMovement.down = false;

        if ( player.ySpeed !== 0 ) {
            gsap.killTweensOf( player, "ySpeed" );
            setDelayed( player, "ySpeed", 0, 0.5 );
        }
    },

    cancelLeft() {
        activeMovement.left = false;
        if ( !activeMovement.right )
            InputController.cancelHorizontal();
    },

    cancelRight() {
        activeMovement.right = false;
        if ( !activeMovement.left )
            InputController.cancelHorizontal();
    },

    cancelUp() {
        activeMovement.up = false;
        if ( !activeMovement.down )
            InputController.cancelVertical();
    },

    cancelDown() {
        activeMovement.down = false;
        if ( !activeMovement.up )
            InputController.cancelVertical();
    }
};
export default InputController;

/* private handlers */

function handleBroadcast( msg, payload ) {
    switch ( msg ) {
        case Messages.GAME_START:
            if ( !handler ) {
                handler = new EventHandler();
                handler.listen( window, "keydown", handleKeyDown );
                handler.listen( window, "keyup",   handleKeyUp );
            }
            break;

        case Messages.GAME_OVER:
            if ( handler ) {
                handler.dispose();
                handler = null;
            }
            break;
    }
}

function handleKeyDown( aEvent ) {

    const keyCode = aEvent.keyCode;

    // prevent defaults when using the arrows, space (prevents page jumps) and backspace (navigate back in history)

    if ( blockDefaults && DEFAULT_BLOCKED.indexOf( keyCode ) > -1 )
        aEvent.preventDefault();

    if ( gameModel.active ) {

        switch ( keyCode ) {

            case 32: // spacebar
                if ( !player.firing )
                    player.startFiring();
                break;

            case 87: // W
            case 38: // up
                InputController.up();
                break;

            case 83: // S
            case 40: // down
                InputController.down();
                break;

            case 65: // A
            case 37: // left
                InputController.left();
                break;

            case 68: // D
            case 39: // right
                InputController.right();
                break;

            case 90: // Z
                if ( !player.switching ) {
                    player.switchLayer();
                }
                break;
        }
   }
}

function handleKeyUp( aEvent ) {

    switch ( aEvent.keyCode ) {
        case 87: // W
        case 38: // up
            InputController.cancelUp();
            break;

        case 83: // S
        case 40: // down
            InputController.cancelDown();
            break;

        case 65: // A
        case 37: // left
            InputController.cancelLeft();
            break;

        case 68: // D
        case 39: // right
            InputController.cancelRight();
            break;

        case 32: // spacebar
            player.stopFiring();
            break;
    }
}
