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
import gsap, { Cubic, Elastic } from "gsap";
import Pubsub        from "pubsub-js";
import Config        from "@/config/Config";
import Assets        from "@/definitions/Assets";
import Messages      from "@/definitions/Messages";
import AnimationUtil from "@/util/AnimationUtil";
import EventHandler  from "@/util/EventHandler";
import HTMLTemplate  from "Templates/title_screen.hbs";

let handler, startButton, highScoresButton, howToPlayButton, aboutButton;
let title, menu, footer, buttons;
let audioModel;

export default {

    render( wrapper, models ) {
        wrapper.innerHTML = HTMLTemplate();

        ({ audioModel } = models );

        // grab references to HTML Elements

        title   = wrapper.querySelector( ".wks-title" );
        menu    = wrapper.querySelector( ".wks-button-list" );
        footer  = wrapper.querySelector( ".wks-footer" );
        buttons = wrapper.querySelectorAll( "button" );

        startButton      = wrapper.querySelector( "#btnStart" );
        highScoresButton = wrapper.querySelector( "#btnHighScores" );
        howToPlayButton  = wrapper.querySelector( "#btnHowToPlay" );
        aboutButton      = wrapper.querySelector( "#btnAbout" );

        animateIn();

        handler = new EventHandler();

        handler.listen( howToPlayButton,  "click",   handleHowToPlayClick );
        handler.listen( highScoresButton, "click",   handleHighScoresClick );
        handler.listen( aboutButton,      "click",   handleAboutClick );
        handler.listen( startButton,      "mouseup", handleStartClick );

        // we deliberately listen to touch events on the document
        // as we can determine whether we need to show on-screen game controls

        handler.listen( document, "touchcancel", handleTouch );
        handler.listen( document, "touchend",    handleTouch );
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handleStartClick( event ) {
    // will otherwise fire multiple times on touch screen (due to multiple handlers for different event types)
    event.preventDefault();

    audioModel.playSoundFX( Assets.AUDIO.AU_LASER );
    AnimationUtil.startGame( audioModel, animateOut );
}

function handleTouch( event ) {
    // in case a touch event was fired, store this in the config
    Config.HAS_TOUCH_CONTROLS = true;
}

function handleHighScoresClick( event ) {
    animateOut(() => {
        Pubsub.publish( Messages.SHOW_HIGHSCORES );
    });
}

function handleAboutClick( event ) {
    animateOut(() => {
        Pubsub.publish( Messages.SHOW_ABOUT );
    });
}

function handleHowToPlayClick( event ) {
    animateOut(() => {
        Pubsub.publish( Messages.SHOW_HOW_TO_PLAY );
    });
}

function animateIn() {
    const tl = gsap.timeline();
    tl.add( gsap.fromTo( title, 2,
        { css: { marginTop: "-200px" }},
        { css: { marginTop: 0 }, ease: Elastic.easeInOut })
    );
    tl.add( gsap.from( footer, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut }));

    for ( let i = 0; i < buttons.length; ++i ) {
        const button = buttons[ i ];
        gsap.fromTo( button, 1.5,
            { css: { marginLeft: `-${window.innerWidth}px` } },
            { css: { marginLeft: "auto" }, ease: Elastic.easeInOut, delay: 1 + ( i * .4 ) }
        );
    }
}

function animateOut( callback ) {
    AnimationUtil.animateOut( title, menu, footer, callback );
}
