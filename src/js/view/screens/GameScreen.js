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
import Pubsub          from "pubsub-js";
import Config          from "@/config/Config";
import Copy            from "@/definitions/Copy";
import Messages        from "@/definitions/Messages";
import AnimationUtil   from "@/util/AnimationUtil";
import EventHandler    from "@/util/EventHandler";
import InputController from "@/controller/InputController";
import HTMLTemplate    from "Templates/game_screen.hbs";

let container, energyUI, scoreUI, messagePanel, messageTitleUI, messageBodyUI, dPad, dPadPosition, btnFire, btnLayer;
let DPAD_OFFSET, DPAD_LEFT, DPAD_RIGHT, DPAD_TOP, DPAD_BOTTOM;
let handler, tokens = [], dPadPointerId, lastDpadHorizontal, lastDpadVertical, player;

let eventOffsetX, eventOffsetY;
const TOUCH_CONTROL_RESPONSE_TIME = 0.3;
const DPAD_POSITION_CLASS = "wks-ui-dpad__position";

export default {

    render( wrapper, models ) {

        const addControls = Config.HAS_TOUCH_CONTROLS;
        player    = models.gameModel.player;
        container = wrapper;

        wrapper.innerHTML = HTMLTemplate({
            controls: addControls
        });

        // grab references to HTML Elements
        energyUI       = wrapper.querySelector( ".wks-ui-energy__bar" );
        scoreUI        = wrapper.querySelector( ".wks-ui-score__counter" );
        messagePanel   = wrapper.querySelector( ".wks-ui-messages" );
        messageTitleUI = messagePanel.querySelector( ".wks-ui-messages__title" );
        messageBodyUI  = messagePanel.querySelector( ".wks-ui-messages__text" );

        if ( addControls ) {
            dPad         = wrapper.querySelector( ".wks-ui-dpad" );
            dPadPosition = wrapper.querySelector( `.${DPAD_POSITION_CLASS}` );
            btnFire      = wrapper.querySelector( ".wks-ui-buttons__fire" );
            btnLayer     = wrapper.querySelector( ".wks-ui-buttons__layer" );

            handler = new EventHandler();

            // listen to window resize/orientation changes

            handler.listen( window, "resize",            handleResize );
            handler.listen( window, "orientationchange", handleResize );

            // button handlers

            handler.listen( btnFire,  "touchstart",  handleFire );
            handler.listen( btnFire,  "touchend",    handleFire );
            handler.listen( btnFire,  "touchcancel", handleFire );
            handler.listen( btnLayer, "touchstart",  handleLayerSwitch );
            handler.listen( dPad,     "touchstart",  handleDPad );
            handler.listen( dPad,     "touchmove",   handleDPad );
            handler.listen( dPad,     "touchend",    handleDPad );
            handler.listen( dPad,     "touchcancel", handleDPad );

            // calculates and caches dPad offsets
            handleResize();
        }

        // subscribe to messaging system

        [
            Messages.SHOW_INSTRUCTIONS,
            Messages.SHOW_MESSAGE,
            Messages.UPDATE_SCORE,
            Messages.UPDATE_ENERGY

        ].forEach(( msg ) => tokens.push( Pubsub.subscribe( msg, handleBroadcast )));

        updateScore( 0 );
    },

    dispose() {
        // unsubscribe from messaging system
        tokens.forEach(( token ) => Pubsub.unsubscribe( token ));
        tokens = [];

        // remove all DOM listeners
        if ( handler ) {
            handler.dispose();
        }
    }
};

/* private methods */

function handleBroadcast( msg, payload ) {

    switch ( msg ) {
        case Messages.SHOW_INSTRUCTIONS:
            showInstructions();
            break;

        case Messages.SHOW_MESSAGE:
            messageTitleUI.innerHTML = payload.title;
            messageBodyUI.innerHTML  = payload.body || "";
            animateMessage();
            break;

        case Messages.UPDATE_SCORE:
            updateScore( payload );
            break;

        case Messages.UPDATE_ENERGY:
            updateEnergy( payload );
            break;
    }
}

function updateEnergy( player ) {
    energyUI.style.width = `${( player.energy / player.maxEnergy ) * 100}px`;
}

function updateScore( score ) {
    scoreUI.innerHTML = score;
}

function animateMessage() {
    gsap.killTweensOf( messagePanel );
    // fade message in
    gsap.fromTo( messagePanel, .5, { css: { autoAlpha: 0 }}, { css: { autoAlpha: 1 }});
    // and remove it after a short period
    gsap.to( messagePanel, .5, { css: { autoAlpha: 0 }, delay: 5 });
}

function handleDPad( event ) {
    // prevent document scrolling
    event.preventDefault();

    const touches = ( event.changedTouches.length > 0 ) ? event.changedTouches : event.touches;

    switch ( event.type ) {

        case "touchstart":
            // store which pointer is touching the dPad (avoids collisions w/ other pointer events)
            dPadPointerId = touches[ 0 ].identifier;
        //    break; // allow fallthrough to move handler

        case "touchmove":

            // retrieve the pointer that is touching the dPad
            let touch;
            for ( let i = 0; i < touches.length; ++i ) {
                touch = touches[ i ];
                if ( touch.identifier === dPadPointerId )
                    break;
            }

            // calculate in which direction(s) the Player should move
            // by determining where in the D pad the pointer is

            eventOffsetX = touch.pageX - DPAD_OFFSET.left;
            eventOffsetY = touch.pageY - DPAD_OFFSET.top;

            const curHor = lastDpadHorizontal;
            const curVer = lastDpadVertical;

            if ( eventOffsetX < DPAD_LEFT ) {
                InputController.left( TOUCH_CONTROL_RESPONSE_TIME, curHor !== 1 );
                lastDpadHorizontal = 1;
            } else if ( eventOffsetX > DPAD_RIGHT ) {
                InputController.right( TOUCH_CONTROL_RESPONSE_TIME, curHor !== 2 );
                lastDpadHorizontal = 2;
            } else {
                InputController.cancelHorizontal();
                lastDpadHorizontal = 0;
            }

            if ( eventOffsetY < DPAD_TOP ) {
                InputController.up( TOUCH_CONTROL_RESPONSE_TIME, curVer !== 1 );
                lastDpadVertical = 1;
            } else if ( eventOffsetY > DPAD_BOTTOM ) {
                InputController.down( TOUCH_CONTROL_RESPONSE_TIME, curVer !== 2 );
                lastDpadVertical = 2;
            } else {
                InputController.cancelVertical();
                lastDpadVertical = 0;
            }

            // show indicator displaying the direction the pad is moving in
            if ( curHor !== lastDpadHorizontal || curVer !== lastDpadVertical ) {
                AnimationUtil.debounce( "dpad", requestDpadPositionUpdate );
            }
            break;

        case "touchcancel":
        case "touchend":
            InputController.cancelHorizontal();
            InputController.cancelVertical();
            lastDpadHorizontal = lastDpadVertical = 0;
            AnimationUtil.debounce( "dpad", requestDpadPositionUpdate, true );
            break;
    }
}

function handleFire( event ) {
    event.preventDefault(); // prevent document zoom on double tap

    switch ( event.type ) {
        case "touchstart":
            if ( !player.firing )
                player.startFiring();
            break;

        case "touchcancel":
        case "touchend":
            player.stopFiring();
            break;
    }
}

function handleLayerSwitch( event ) {
    event.preventDefault(); // prevent document zoom on double tap
    if ( !player.switching )
        player.switchLayer();
}

function handleResize( event ) {
    // get bounding box of dPad element
    DPAD_OFFSET = dPad.getBoundingClientRect();

    // calculate center points of element (relative to its x, y coordinate)
    const hCenter = DPAD_OFFSET.width  / 2;
    const vCenter = DPAD_OFFSET.height / 2;

    const horizontalDelta = DPAD_OFFSET.width  / 6;
    const verticalDelta   = DPAD_OFFSET.height / 6;

    // cache coordinates for handleDPad
    // basically we subtract the calculated horizontal and vertical delta from
    // the center coordinate so we only respond to interactions on the outer edges
    // of the dpad (otherwise we are always moving in both axes)

    DPAD_LEFT   = hCenter - horizontalDelta;
    DPAD_RIGHT  = hCenter + horizontalDelta;
    DPAD_TOP    = vCenter - verticalDelta;
    DPAD_BOTTOM = vCenter + verticalDelta;
}

function showInstructions() {
    const docs = Config.HAS_TOUCH_CONTROLS ? Copy.TUTORIAL.TOUCH : Copy.TUTORIAL.KEYBOARD;

    const el = document.createElement( "div" );
    el.setAttribute( "class", "wks-ui-instructions" );
    container.appendChild( el );

    const tl = gsap.timeline();
    tl.add( gsap.delayedCall( 1, () => true ));

    let lastDisplayedDoc = -1;
    for ( let i = 0, l = docs.length; i < l; ++i ) {
        tl.add( gsap.delayedCall( docs[ i ].timeout, () => {
            el.innerHTML = docs[ ++lastDisplayedDoc ].text;
        }));
    }
    // all done, start the game actions queue
    tl.add( gsap.delayedCall( 4, () => {
        // null check as the player can die during the instructions ;)
        // (leads to this screen to have been removed)
        if ( el ) {
            container.removeChild( el );
        }
        Pubsub.publish( Messages.INSTRUCTIONS_COMPLETE );
    }));
}

function requestDpadPositionUpdate() {
    let cssClass = DPAD_POSITION_CLASS;

    if ( lastDpadHorizontal === 1 ) cssClass = `${cssClass} left`;
    else if ( lastDpadHorizontal === 2 ) cssClass = `${cssClass} right`;

    if ( lastDpadVertical === 1 ) cssClass = `${cssClass} top`;
    else if ( lastDpadVertical === 2 ) cssClass = `${cssClass} bottom`;

    dPadPosition.className = cssClass;
}
