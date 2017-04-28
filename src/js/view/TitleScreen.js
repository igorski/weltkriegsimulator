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

let handler, startButton;

module.exports = {

    render( wrapper, templateService ) {
        templateService.render( "Screen_Title", wrapper, {

        }).then(() => {

            // grab references to HTML Elements
            startButton = wrapper.querySelector( "#btnStart" );

            handler = new EventHandler();

            // we deliberately listen to mouse and touch events (instead of "click")
            // as we can determine whether we need to show on-screen game controls

            handler.listen( startButton, "mouseup",     handleStart );
            handler.listen( startButton, "touchcancel", handleStart );
            handler.listen( startButton, "touchend",    handleStart );
        });
    },

    dispose() {
        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handleStart( event ) {

    // in case a touch event was fired, store this in the config

    if ( event.type.indexOf( "touch" ) >= 0 ) {
        Config.HAS_TOUCH_CONTROLS = true;
    }

    // start this game!
    Pubsub.publish( Messages.GAME_STARTED );
}
