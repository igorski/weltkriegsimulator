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
"use strict";

/* initialize application */

if ( !"TweenMax" in window )
    throw new Error( "GreenSock TweenMax required" );

// grab reference to application container in template

const container = document.querySelector( "#application" );

// set up "framework"

const WKS = window.WKS = {
    inputController  : require( "./controller/InputController" ),
    gameController   : require( "./controller/GameController" ),
    renderController : require( "./controller/RenderController" ),
    screenController : require( "./controller/ScreenController" ),
    gameModel        : require( "./model/Game" ),
    audioModel       : require( "./model/Audio" )
};

// prepare dependencies

const MusicService = require( "./services/MusicService" );
MusicService.prepare().
    then(() => {
        WKS.audioModel.sdkReady = true;
        init();
    }).
    catch(() => {
        // failure during loading of SoundCloud SDK, continue
        // as is (Audio model will not play music)
        init();
    });

// initialize controllers, this starts the app

function init() {
    WKS.gameController.init( WKS );
    WKS.inputController.init( WKS );
    WKS.renderController.init( WKS, container );
    WKS.screenController.init( WKS, container );
}
