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

const Config      = require( "../config/Config" );
const AudioTracks = require( "../definitions/AudioTracks" );
const Messages    = require( "../definitions/Messages" );
const Pubsub      = require( "pubsub-js" );

let _inited        = false;
let _sound         = null;
let _queuedTrackId = null;

const Audio = module.exports = {

    playing  : false,
    muted    : false, // window.location.href.indexOf( "localhost" ) === -1,

    /**
     * @public
     */
    init() {
        if ( _inited || !( "SC" in window ))
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

        if ( !_inited || self.muted )
            return;
    
        if ( _queuedTrackId === aTrackId && self.playing )
            return; // already playing this tune!
    
        self.stop(); // stop playing the current track (TODO : fade out?)
    
        _queuedTrackId = aTrackId;
    
        SC.stream( "/tracks/" + aTrackId, ( sound ) => {
            _sound = sound;
            sound.play();
            self.playing = true;

            // get track META
            SC.get( "/tracks/" + aTrackId, ( track ) => {
                if ( track && track.user ) {
                    Pubsub.publish( Messages.SHOW_MUSIC, {
                        title: track.title,
                        author: track.user.username
                    });
                }
            });
        });
    },
    
    /**
     * play the music!
     *
     * @public
     */
    play() {
        const self = Audio;
        if ( !self.muted ) {
            const trackId = enqueueTrack();

            if ( trackId )
                self.playTrack( trackId );
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

function enqueueTrack() {
    const tracks = AudioTracks.getAll();
    const amount = tracks.length;

    if ( amount === 0 )
        return null;

    let trackId;

    if ( amount > 1 ) {
        // get random song from list, as long as it isn't the
        // last played song so we can have a little more variation!
        do {
            trackId = tracks[ Math.floor( Math.random() * amount )];
        }
        while ( _queuedTrackId === trackId );
    }
    else {
        trackId = tracks[ 0 ];
    }
    return trackId;
}
