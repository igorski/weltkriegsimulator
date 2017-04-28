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

const Messages = require( "../definitions/Messages" );
const Pubsub   = require( "pubsub-js" );
const Actions  = require( "../actions/Actions" );

let audioModel, gameModel;
let actionTimeout;

module.exports = {

    init( wks ) {

        audioModel = wks.audioModel;
        gameModel  = wks.gameModel;

        // subscribe to pubsub system to receive and broadcast messages

        [
            Messages.GAME_STARTED,
            Messages.GAME_OVER,
            Messages.FIRE_BULLET

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));
    }
};

/* private methods */

function handleBroadcast( type, payload ) {

    switch ( type ) {
        case Messages.GAME_STARTED:
            gameModel.player.reset();
            gameModel.active = true;
            // start the music
            audioModel.play();
            // start the game actions queue
            startActions( Actions.reset() );
            break;

        case Messages.GAME_OVER:
            gameModel.active = false;
            stopActions();
            break;

        case Messages.FIRE_BULLET:
            gameModel.fireBullet( payload );
            break;
    }
}

/**
 * actions are scheduled periodic changes that
 * update the game world and its properties
 */
function startActions( timeout ) {
    actionTimeout = setTimeout( executeAction, timeout );
}

function executeAction() {
    // execute and enqueue next action
    startActions( Actions.execute( gameModel ));
}

function stopActions() {
    clearTimeout( actionTimeout );
}