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
import Pubsub       from "pubsub-js";
import Messages     from "@/definitions/Messages";
import EventHandler from "@/util/EventHandler";
import HTMLTemplate from "Templates/high_score_screen.hbs";
import gsap, { Cubic, Elastic } from "gsap";

let handler, text, playButton, homeButton;
let title, footer;

export default {

    render( wrapper, models ) {

        wrapper.innerHTML = HTMLTemplate({
            scores: models.highScoresModel.get()
        });

        // grab references to HTML Elements

        title   = wrapper.querySelector( ".wks-title" );
        footer  = wrapper.querySelector( ".wks-footer" );
        text    = wrapper.querySelector( ".wks-text" );

        playButton = wrapper.querySelector( ".wks-menu__play-button" );
        homeButton = wrapper.querySelector( ".wks-menu__home-button" );

        animateIn();

        handler = new EventHandler();
        handler.listen( playButton, "click", handlePlayClick );
        handler.listen( homeButton, "click", handleBackClick );
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handlePlayClick( event ) {

    animateOut(() => {
        Pubsub.publish( Messages.GAME_START );
    });
}

function handleBackClick( event ) {

    animateOut(() => {
        Pubsub.publish( Messages.SHOW_TITLE_SCREEN );
    });
}

function animateIn() {
    const tl = gsap.timeline();
    tl.add( gsap.to( text, 0, { css: { autoAlpha: 0 }} ));
    tl.add( gsap.fromTo( title, 2,
        { css: { marginTop: "-200px" }},
        { css: { marginTop: 0 }, ease: Elastic.easeInOut })
    );
    tl.add( gsap.to( text, 1, { css: { autoAlpha: 1 }}));
    tl.add( gsap.from( footer, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut }));
}

function animateOut( callback ) {
    const tl = gsap.timeline();
    tl.add( gsap.to( text, 1, { css: { autoAlpha: 0 }, onComplete: () => {
        gsap.to( title, 1, { css: { marginTop: "-200px" }, ease: Cubic.easeIn, onComplete: callback });
        gsap.to( footer, 1, { css: { bottom: "-200px" }, ease: Cubic.easeIn });
    }}));
}
