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
import Messages         from "../definitions/Messages";
import Pubsub           from "pubsub-js";
import TitleScreen      from "../view/TitleScreen";
import GameScreen       from "../view/GameScreen";
import GameOverScreen   from "../view/GameOverScreen";
import HighScoresScreen from "../view/HighScoresScreen";
import AboutScreen      from "../view/AboutScreen";
import HowToPlayScreen  from "../view/HowToPlayScreen";

let wrapper, currentScreen, gameModel, highScoresModel;

export default {

    init( container, gameModelRef, highScoresModelRef ) {

        gameModel       = gameModelRef;
        highScoresModel = highScoresModelRef;

        wrapper = document.createElement( "div" );
        wrapper.setAttribute( "id", "screenOverlay" );
        container.appendChild( wrapper );

        // subscribe to messaging system

        [
            Messages.SHOW_TITLE_SCREEN,
            Messages.SHOW_HIGHSCORES,
            Messages.SHOW_ABOUT,
            Messages.SHOW_HOW_TO_PLAY,
            Messages.GAME_START,
            Messages.GAME_OVER

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));

        // render the first screen

        renderScreen( TitleScreen );
    }
};

/* private methods */

function handleBroadcast( msg, payload ) {
    switch ( msg ) {
        case Messages.SHOW_TITLE_SCREEN:
            renderScreen( TitleScreen );
            break;

        case Messages.SHOW_HIGHSCORES:
            renderScreen( HighScoresScreen );
            break;

        case Messages.SHOW_HOW_TO_PLAY:
            renderScreen( HowToPlayScreen );
            break;

        case Messages.SHOW_ABOUT:
            renderScreen( AboutScreen );
            break;

        case Messages.GAME_START:
            renderScreen( GameScreen );
            break;

        case Messages.GAME_OVER:
            renderScreen( GameOverScreen );
            break;
    }
}

function renderScreen( screen ) {
    if ( currentScreen ) {
        currentScreen.dispose();
        wrapper.innerHTML = "";
    }
    screen.render( wrapper, gameModel, highScoresModel );
    currentScreen = screen;
}
