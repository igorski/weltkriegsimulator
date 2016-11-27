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

const Pubsub   = require( "pubsub-js" );
const Messages = require( "../definitions/Messages" );

let gameModel, energyUI;

module.exports = {

    init( game, container ) {

        gameModel = game.gameModel;

        energyUI = document.createElement( "div" );
        energyUI.setAttribute( "id", "energy" );

        document.body.appendChild( energyUI );

        // subscribe to messaging system

        [
            Messages.PLAYER_HIT

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));

    }
};

/* private methods */

function handleBroadcast( msg, payload ) {

    switch ( msg ) {
        case Messages.PLAYER_HIT:
            updateEnergy();
            break;
    }
}

function updateEnergy() {

    const player = gameModel.player;
    energyUI.style.width = (( player.energy / player.maxEnergy ) * 100 ) + "px";
}