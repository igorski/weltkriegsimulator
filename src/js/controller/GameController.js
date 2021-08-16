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
import gsap          from "gsap";
import Pubsub        from "pubsub-js";
import Messages      from "@/definitions/Messages";
import ActionFactory from "@/factory/ActionFactory";
import Assets        from "@/definitions/Assets";

let audioModel, gameModel, settingsModel;
let actionTimeout;

export default {

    init( models) {
        ({ gameModel, audioModel, settingsModel } = models );

        // subscribe to pubsub system to receive and broadcast messages

        [
            Messages.GAME_START,
            Messages.GAME_OVER,
            Messages.BOSS_DEFEATED,
            Messages.INSTRUCTIONS_COMPLETE

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));
    }
};

/* private methods */

function handleBroadcast( type, payload ) {

    switch ( type ) {
        case Messages.GAME_START:
            gameModel.reset();
            // start the music
            audioModel.playEnqueuedTrack();

            if ( !settingsModel.get( settingsModel.PROPS.HAS_PLAYED )) {
                // show instructions first
                gsap.delayedCall( .5, () => Pubsub.publish( Messages.SHOW_INSTRUCTIONS ));
            }
            else {
                startActionQueue();
            }
            break;

        case Messages.GAME_OVER:
            gameModel.active = false;
            stopActions();
            audioModel.playSoundFX( Assets.AUDIO.AU_EXPLOSION );
            // enqueue next music track so we have a different one ready for the next game
            audioModel.enqueueTrack();
            // store the flag stating the player has played at least one game
            settingsModel.set( settingsModel.PROPS.HAS_PLAYED, true );
            break;

        case Messages.BOSS_DEFEATED:
            // restart the action queue for the next "level"
            executeAction();
            break;

        case Messages.INSTRUCTIONS_COMPLETE:
            startActionQueue();
            break;
    }
}

function startActionQueue() {
    // start the game actions queue
    startActions( ActionFactory.reset() );
}

/**
 * actions are scheduled periodic changes that
 * update the game world and its properties
 */
function startActions( timeout ) {
    if ( typeof timeout === "number" )
        actionTimeout = gsap.delayedCall( timeout, executeAction );
}

function executeAction() {
    // execute and enqueue next action
    startActions( ActionFactory.execute( gameModel ));
}

function stopActions() {
    if ( actionTimeout ) {
        actionTimeout.kill();
        actionTimeout = null;
    }
}
