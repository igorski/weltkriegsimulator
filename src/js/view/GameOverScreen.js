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

const Messages     = require( "../definitions/Messages" );
const Pubsub       = require( "pubsub-js" );
const EventHandler = require( "../util/EventHandler" );

let gameModel, highScoresModel, handler, text, playButton, homeButton, nameInput, saveButton;
let title, footer;

module.exports = {

    render( wrapper, templateService, wks ) {

        gameModel       = wks.gameModel;
        highScoresModel = wks.highScoresModel;

        const player       = gameModel.player;
        const score        = player.score;
        const hasHighScore = highScoresModel.isNewScore( score );

        templateService.render( "Screen_GameOver", wrapper, {

            highScore: hasHighScore,
            score: score

        }).then(() => {

            // grab references to HTML Elements

            title   = wrapper.querySelector( "h1" );
            footer  = wrapper.querySelector( "footer" );
            text    = wrapper.querySelector( "#text" );

            nameInput  = wrapper.querySelector( "#nameInput" );
            saveButton = wrapper.querySelector( "#saveHighScore" );
            playButton = wrapper.querySelector( "#btnPlay" );
            homeButton = wrapper.querySelector( "#btnHome" );

            handler = new EventHandler();

            // in case of new high score, show last known player name
            // as well as option to save this stuff!

            if ( hasHighScore ) {
                if ( player.name.length > 0 )
                    nameInput.value = player.name;

                handler.listen( saveButton, "click", handleSaveClick );
            }
            handler.listen( playButton, "click", handlePlayClick );
            handler.listen( homeButton, "click", handleHomeClick );

            animateIn();
        });
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handleSaveClick( event ) {

    event.preventDefault();

    if ( nameInput.value.length > 2 ) {

        gameModel.player.name = nameInput.value;
        highScoresModel.save( gameModel.player.name, gameModel.player.score );

        animateOut(() => {
            Pubsub.publish( Messages.SHOW_HIGHSCORES );
        });
    }
    else {
        nameInput.classList.add( "error" );
    }
}

function handlePlayClick( event ) {

    event.preventDefault(); // prevents double firing on touch screens

    animateOut(() => {
        Pubsub.publish( Messages.GAME_START );
    });
}

function handleHomeClick( event ) {

    event.preventDefault(); // prevents double firing on touch screens

    animateOut(() => {
        Pubsub.publish( Messages.SHOW_TITLE_SCREEN );
    });
}

function animateIn() {
    const tl = new TimelineMax();
    tl.add( TweenMax.to( text, 0, { css: { autoAlpha: 0 }} ));
    tl.add( TweenMax.fromTo( title, 2,
        { css: { marginTop: "-200px" }},
        { css: { marginTop: 0 }, ease: Elastic.easeInOut })
    );
    tl.add( TweenMax.to( text, 1, { css: { autoAlpha: 1 }}));
    tl.add( TweenMax.from( footer, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut }));
}

function animateOut( callback ) {
    const tl = new TimelineMax();
    tl.add( TweenMax.to( text, 1, { css: { autoAlpha: 0 }, onComplete: () => {
        TweenMax.to( title, 1, { css: { marginTop: "-200px" }, ease: Cubic.easeIn, onComplete: callback });
        TweenMax.to( footer, 1, { css: { bottom: "-200px" }, ease: Cubic.easeIn });
    }}));
}
