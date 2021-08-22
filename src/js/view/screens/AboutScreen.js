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
import EventHandler  from "@/util/EventHandler";
import AnimationUtil from "@/util/AnimationUtil";
import HTMLTemplate  from "Templates/about_screen.hbs";

let handler, text, playButton, homeButton;
let title, footer;

export default {

    render( wrapper, models ) {
        wrapper.innerHTML = HTMLTemplate({
            resources: [
                { name: "Explosion by Cuzco", href: "https://opengameart.org/content/explosion" },
                { name: "Ship by Redshrike",  href: "https://opengameart.org/content/space-ship-building-bits-volume-1" },
                { name: "Spaceships by wuhu", href: "https://opengameart.org/content/spaceships-1" },
                { name: "Retro shmup boss 2 by Jerom", href: "https://opengameart.org/content/retro-shmup-boss-2" },
                { name: "Explosion by TinyWorlds", href: "https://opengameart.org/content/explosion-0" },
                { name: "Some Hud Elements, Icons and Crosshairs by sbed", href: "https://opengameart.org/content/some-hud-elements-icons-and-crosshairs" },
                { name: "Font \"Astral Delight\" by imagex", href: "http://www.dafont.com/astral-delight.font?fpp=100&text=WELTKRIEGSIMULATOR" },
                { name: "Animated flowing water 2d 16x16 by InThePixel", href: "https://opengameart.org/content/animated-flowing-water-2d-16x16" }
            ]
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

    animateOut(() => {
        Pubsub.publish( Messages.GAME_START );
    });
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
