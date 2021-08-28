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
import Pubsub   from "pubsub-js";
import Messages from "@/definitions/Messages";

const pendingDebounces = new Map();

export default {
    /**
     * Animates in any of the Screen contents, divided by top-, middle- and botom layers.
     */
    animateIn( topContent, middleContent, bottomContent ) {
        const tl = gsap.timeline();
        tl.add( gsap.to( middleContent, 0, { css: { autoAlpha: 0 }} ));
        gsap.fromTo( topContent, 2,
            { css: { marginTop: "-200px" }},
            { css: { marginTop: 0 }, ease: Elastic.easeInOut }
        );
        gsap.from( bottomContent, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut });
        tl.add( gsap.to( middleContent, 1, { css: { autoAlpha: 1 }, delay: 1.5 }));
    },

    /**
     * Animates out any of the Screen contents, divided by top-, middle- and botom layers.
     */
     animateOut( topContent, middleContent, bottomContent, callback ) {
        const tl = gsap.timeline();
        tl.add( gsap.to( middleContent, 0.75, { css: { autoAlpha: 0 }, onComplete: () => {
            gsap.to( topContent, 0.75, { css: { marginTop: "-200px" }, ease: Cubic.easeIn, onComplete: callback });
            gsap.to( bottomContent, 0.75, { css: { bottom: "-200px" }, ease: Cubic.easeIn });
        }}));
    },

    /**
     * Handler that calls given animateOutFunction and triggers the
     * game start upon animation completion. This also starts the music
     * synchronously (to ensure that audio playback is unmuted after user
     * input on mobile devices)
     */
    startGame( audioModel, animateOutFunction ) {
        audioModel.init();
        audioModel.playEnqueuedTrack();
        animateOutFunction(() => {
            Pubsub.publish( Messages.GAME_START );
        });
    },

    /**
     * Debounce a callback to only execute when the browser
     * is ready to paint (on requestAnimationFrame). This ensures
     * multiple calls (for instance DOM updates on input events)
     * only happen once, when the browser renders
     */
    debounce( name, callback, replaceExisting = false ) {
        if ( pendingDebounces.has( name )) {
            if ( !replaceExisting ) {
                return;
            }
            window.cancelAnimationFrame( pendingDebounces.get( name ));
        }
        pendingDebounces.set( name, window.requestAnimationFrame(() => {
            callback();
            pendingDebounces.delete( name );
        }));
    }
};
