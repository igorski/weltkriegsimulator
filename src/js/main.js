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

const Pubsub     = require( "pubsub-js" );
const Messages   = require( "./definitions/Messages" );
const AudioTrack = require( "./definitions/AudioTracks" );

/* initialize application */

if ( !"TweenMax" in window )
    throw new Error( "GreenSock TweenMax required" );

// grab reference to application container in template

const container = document.querySelector( "#application" );

const Game = window.game = {
    inputController  : require( "./controller/InputController" ),
    renderController : require( "./controller/RenderController" ),
    screenController : require( "./controller/ScreenController" ),
    gameModel        : require( "./model/Game" ),
    audioModel       : require( "./model/Audio" )
};

// subscribe to pubsub system to receive and broadcast messages across the application

[
    Messages.GAME_STARTED,
    Messages.FIRE_BULLET

].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));

/* initialize */

Game.inputController.init( Game );
Game.renderController.init( Game, container );
Game.screenController.init( container );

/* private methods */

// TODO: create dedicated controller for this?

function handleBroadcast( type, payload ) {

    switch ( type ) {
        case Messages.GAME_STARTED:
            Game.audioModel.playTrack( AudioTrack.BATTLE_THEME );
            break;

        case Messages.FIRE_BULLET:
            Game.gameModel.fireBullet( payload );
            break;
    }
}
