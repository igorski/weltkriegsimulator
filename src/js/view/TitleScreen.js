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

const Config       = require( "../config/Config" );
const Messages     = require( "../definitions/Messages" );
const Pubsub       = require( "pubsub-js" );
const EventHandler = require( "../util/EventHandler" );

let handler, startButton, highScoresButton, howToPlayButton;
let title, menu, footer, buttons;

module.exports = {

    render( wrapper, templateService ) {

        templateService.render( "Screen_Title", wrapper, {

        }).then(() => {

            // grab references to HTML Elements

            title   = wrapper.querySelector( "h1" );
            menu    = wrapper.querySelector( "#menu" );
            footer  = wrapper.querySelector( "footer" );
            buttons = wrapper.querySelectorAll( "button" );

            startButton      = wrapper.querySelector( "#btnStart" );
            highScoresButton = wrapper.querySelector( "#btnHighScores" );
            howToPlayButton  = wrapper.querySelector( "#btnHowToPlay" );

            animateIn();

            handler = new EventHandler();

            // we deliberately listen to mouse and touch events (instead of "click")
            // as we can determine whether we need to show on-screen game controls

            handler.listen( startButton, "mouseup",     handleStartClick );
            handler.listen( startButton, "touchcancel", handleStartClick );
            handler.listen( startButton, "touchend",    handleStartClick );
        });
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handleStartClick( event ) {

    event.preventDefault(); // prevents double firing on touch screens

    // in case a touch event was fired, store this in the config

    if ( event.type.indexOf( "touch" ) >= 0 ) {
        Config.HAS_TOUCH_CONTROLS = true;
    }

    animateOut(() => {
        // start this game!
        Pubsub.publish( Messages.GAME_STARTED );
    });
}

function animateIn() {
    const tl = new TimelineMax();
    tl.add( TweenMax.to( menu, 0, { css: { autoAlpha: 0 }} ));
    tl.add( TweenMax.fromTo( title, 2,
        { css: { marginTop: "-200px" }},
        { css: { marginTop: 0 }, ease: Elastic.easeInOut })
    );
    tl.add( TweenMax.to( menu, 1, { css: { autoAlpha: 1 }}));
    tl.add( TweenMax.from( footer, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut }));

    for ( let i = 0; i < buttons.length; ++i ) {
        const button = buttons[ i ];
        TweenMax.from( button, 1.5, {
            css: { marginLeft: `-${window.innerWidth}px` },
            ease: Elastic.easeInOut, delay: 1 + ( i * .4 )
        });
    }
}

function animateOut( callback ) {
    const tl = new TimelineMax();
    tl.add( TweenMax.to( menu, 1, { css: { autoAlpha: 0 }, onComplete: () => {
        TweenMax.to( title, 1, { css: { marginTop: "-200px" }, ease: Cubic.easeIn, onComplete: callback });
        TweenMax.to( footer, 1, { css: { bottom: "-200px" }, ease: Cubic.easeIn });
    }}));
}
