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
import Pubsub        from "pubsub-js";
import Messages      from "@/definitions/Messages";
import AnimationUtil from "@/util/AnimationUtil";
import EventHandler  from "@/util/EventHandler";
import HTMLTemplate  from "Templates/how_to_play_screen.hbs";

let models, handler, text, playButton, homeButton;
let title, footer;

export default {

    render( wrapper, modelRefs ) {

        models = modelRefs;

        wrapper.innerHTML = HTMLTemplate();

        // grab references to HTML Elements

        title   = wrapper.querySelector( ".wks-title" );
        footer  = wrapper.querySelector( ".wks-footer" );
        text    = wrapper.querySelector( ".wks-text" );

        playButton = wrapper.querySelector( ".wks-menu__play-button" );
        homeButton = wrapper.querySelector( ".wks-menu__home-button" );

        animateIn();

        handler = new EventHandler();
        handler.listen( playButton, "click", handlePlayClick );
        handler.listen( homeButton, "click", handleHomeClick );
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handlePlayClick( event ) {
    AnimationUtil.startGame( models.audioModel, animateOut );
}

function handleHomeClick( event ) {

    animateOut(() => {
        Pubsub.publish( Messages.SHOW_TITLE_SCREEN );
    });
}

function animateIn() {
    AnimationUtil.animateIn( title, text, footer );
}

function animateOut( callback ) {
    AnimationUtil.animateOut( title, text, footer, callback );
}
