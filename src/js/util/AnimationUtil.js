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

export default {
    /**
     * Animates in any of the Screen contents, divided by top-, middle- and botom layers.
     */
    animateIn( topContent, middleContent, bottomContent ) {
        const tl = gsap.timeline();
        tl.add( gsap.to( middleContent, 0, { css: { autoAlpha: 0 }} ));
        tl.add( gsap.fromTo( topContent, 2,
            { css: { marginTop: "-200px" }},
            { css: { marginTop: 0 }, ease: Elastic.easeInOut })
        );
        tl.add( gsap.to( middleContent, 1, { css: { autoAlpha: 1 }}));
        tl.add( gsap.from( bottomContent, 1.5, { css: { bottom: "-200px" }, ease: Cubic.easeOut }));
    },

    /**
     * Animates out any of the Screen contents, divided by top-, middle- and botom layers.
     */
     animateOut( topContent, middleContent, bottomContent, callback ) {
        const tl = gsap.timeline();
        tl.add( gsap.to( middleContent, 1, { css: { autoAlpha: 0 }, onComplete: () => {
            gsap.to( topContent, 1, { css: { marginTop: "-200px" }, ease: Cubic.easeIn, onComplete: callback });
            gsap.to( bottomContent, 1, { css: { bottom: "-200px" }, ease: Cubic.easeIn });
        }}));
    },

    /**
     * Handler that calls given animateOutFunction and triggers the
     * game start upon animation completion. This also starts the music
     * synchronously (to ensure that audio playback is unmuted after user
     * input on mobile devices)
     */
    startGame( audioModel, animateOutFunction ) {
        audioModel.playEnqueuedTrack();
        animateOutFunction(() => {
            Pubsub.publish( Messages.GAME_START );
        });
    }
};
