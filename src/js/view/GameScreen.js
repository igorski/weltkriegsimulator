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

const Config          = require( "../config/Config" );
const Messages        = require( "../definitions/Messages" );
const Pubsub          = require( "pubsub-js" );
const EventHandler    = require( "../util/EventHandler" );
const InputController = require( "../controller/InputController" );

let energyUI, messagePanel, messageTitleUI, messageBodyUI, dPad, btnFire, btnLayer;
let handler, tokens = [];

module.exports = {

    render( wrapper, templateService ) {

        const addControls = Config.HAS_TOUCH_CONTROLS;

        templateService.render( "Screen_Game", wrapper, {

            "controls": addControls

        }).then(() => {

            // grab references to HTML Elements
            energyUI       = wrapper.querySelector( "#energy" );
            messagePanel   = wrapper.querySelector( "#messages" );
            messageTitleUI = messagePanel.querySelector( ".title" );
            messageBodyUI  = messagePanel.querySelector( ".body" );

            if ( addControls ) {
                dPad     = wrapper.querySelector( "#dPad" );
                btnFire  = wrapper.querySelector( "#btnFire" );
                btnLayer = wrapper.querySelector( "#btnLayer" );

                handler = new EventHandler();

                handler.listen( btnFire,  "touchstart",  handleFire );
                handler.listen( btnLayer, "touchstart",  handleLayerSwitch );
                handler.listen( dPad,     "touchmove",   handleDPad );
                handler.listen( dPad,     "touchend",    handleDPad );
                handler.listen( dPad,     "touchcancel", handleDPad );
            }

            // subscribe to messaging system

            [
                Messages.SHOW_MUSIC,
                Messages.PLAYER_HIT

            ].forEach(( msg ) => tokens.push( Pubsub.subscribe( msg, handleBroadcast )));
        });
    },

    dispose() {
        // unsubscribe from messaging system
        tokens.forEach(( token ) => Pubsub.unsubscribe( token ));
        tokens = [];

        // remove all DOM listeners
        if ( handler )
            handler.dispose();
    }
};

/* private methods */

function handleBroadcast( msg, payload ) {

    switch ( msg ) {
        case Messages.SHOW_MUSIC:
            messageTitleUI.innerHTML = "Now playing:";
            messageBodyUI.innerHTML  = `"${payload.title}" by ${payload.author}`;

            animateMessage();
            break;

        case Messages.PLAYER_HIT:
            updateEnergy( payload.player );
            break;
    }
}

function updateEnergy( player ) {
    energyUI.style.width = (( player.energy / player.maxEnergy ) * 100 ) + "px";
}

function animateMessage() {
    TweenMax.killTweensOf( messagePanel );
    // fade message in
    TweenMax.fromTo( messagePanel, .5, { css: { autoAlpha: 0 }}, { css: { autoAlpha: 1 }});
    // and remove it after a short period
    TweenMax.to( messagePanel, .5, { css: { autoAlpha: 0 }, delay: 5 });
}

function handleDPad( event ) {
    // prevent document scrolling
    event.preventDefault();

    switch ( event.type ) {
        case "touchmove":

            const touches = ( event.touches.length > 0 ) ? event.touches : event.changedTouches;

            if ( touches.length > 0 ) {
                // TODO: cache this

                const offset = dPad.getBoundingClientRect();
                const width = offset.width;
                const hCenter = width / 2;
                const height = offset.height;
                const vCenter = height / 2;

                // calculate offset

                const eventOffsetX = touches[ 0 ].pageX - offset.left;
                const eventOffsetY = touches[ 0 ].pageY - offset.top;
                let hSpeed;

                if ( eventOffsetX < hCenter ) {
                    hSpeed = -(( hCenter - eventOffsetX ) / hCenter );
                    InputController.left( hSpeed );
                }
                else if ( eventOffsetX > hCenter ) {
                    hSpeed = ( eventOffsetX - hCenter ) / hCenter;
                    InputController.right( hSpeed );
                }
                console.warn("horizontal speed:" + hSpeed );
            }
            break;

        case "touchcancel":
        case "touchend":

            break;
    }
}

function handleFire( event ) {
    InputController.fire();
}

function handleLayerSwitch( event ) {
    InputController.switchLayer();
}
