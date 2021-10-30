/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016-2017 - http://www.igorski.nl
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
import PubSub           from "pubsub-js";
import Messages         from "./definitions/Messages";
import inputController  from "./controller/InputController";
import gameController   from "./controller/GameController";
import renderController from "./controller/RenderController";
import screenController from "./controller/ScreenController";
import audioModel       from "./model/Audio";
import gameModel        from "./model/Game";
import settingsModel    from "./model/Settings";
import highScoresModel  from "./model/HighScores";
import AssetService     from "./services/AssetService";
import StyleSheet       from "../assets/css/_root.scss";

/* initialize application */

// grab reference to application container in template

const container = document.querySelector( "#application" ) || document.querySelector( "body" );

// set up global "framework" (used for creating hooks for high score retrieval/saving)

const WKS = window.WKS = {
    inited : false,
    pubSub : PubSub
};

// start the application

function init() {

    document.body.classList.remove( "loading" );

    // initialize models

    const models = {
        audioModel,
        gameModel,
        settingsModel,
        highScoresModel,
    };

    settingsModel.init();
    highScoresModel.init();

    // apply stored settings

    audioModel.muted = !settingsModel.get( settingsModel.PROPS.MUSIC_ON );

    // initialize controllers

    gameController.init( models );
    inputController.init( models );
    renderController.init( container, models );
    screenController.init( container, models );

    if ( process.env.NODE_ENV === "development" ) {
        WKS.models = models; // expose models for debugging
    }
    PubSub.publish( Messages.READY );
    WKS.inited = true;
}

// load the assets and launch

AssetService.prepare().then( init );
