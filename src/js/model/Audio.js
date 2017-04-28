/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2015-2017 - http://www.igorski.nl
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

const Config = require( "../config/Config" );

let _inited      = false;
let _sound       = null;      // currently playing sound
let _lastTrackId = null;  // last played track Id

const Audio = module.exports = {

    playing  : false,
    muted    : false, // window.location.href.indexOf( "localhost" ) !== -1,
    sdkReady : false,

    /**
     * @public
     */
    init() {
        if ( _inited || !Audio.sdkReady )
            return;

        SC.initialize({
            client_id: Config.SOUNDCLOUD_CLIENT_ID
            //    ,redirect_uri: "https://developers.soundcloud.com/callback.html"
        });

        _inited = true;
    },
    
    /**
     * play a track by its unique identifier
     * (you can retrieve the identifier by clicking "Share" on the track page,
     * selecting "Embed" and retrieving the numerical value from the URL)
     *
     * @public
     *
     * @param {string} aTrackId
     */
    playTrack( aTrackId ) {
        const self = Audio;

        if ( !self.sdkReady || self.muted )
            return;
    
        self.init();

        if ( _lastTrackId === aTrackId && self.playing )
            return; // already playing this tune!
    
        self.stop(); // stop playing the current track (TODO : fade out?)
    
        _lastTrackId = aTrackId;
    
        SC.stream( "/tracks/" + aTrackId, ( sound ) => {
            _sound = sound;
            sound.play();
            self.playing = true;
        });
    },
    
    /**
     * continue playing the last track id
     *
     * @public
     */
    play() {
        const self = Audio;
        if ( !self.muted && !self.playing ) {
            self.playTrack( _lastTrackId );
        }
    },
    
    /**
     * stops playing all tracks
     *
     * @public
     */
    stop() {
        if ( _sound ) {
            _sound.stop();
            _sound = null;
        }
        Audio.playing = false;
    }
};
