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

const Config       = require( "../config/Config" );
const AudioTracks  = require( "../definitions/AudioTracks" );
const Messages     = require( "../definitions/Messages" );
const Pubsub       = require( "pubsub-js" );
const EventHandler = require( "../util/EventHandler" );

let inited        = false;
let sound         = null;
let queuedTrackId = null;
let handler;

const Audio = module.exports = {

    playing  : false,
    muted    : false, // window.location.href.indexOf( "localhost" ) === -1,

    /**
     * @public
     */
    init() {
        if ( inited || !( "SC" in window ))
            return;

        SC.initialize({
            client_id: Config.SOUNDCLOUD_CLIENT_ID
            //    ,redirect_uri: "https://developers.soundcloud.com/callback.html"
        });
        inited = true;
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

        if ( !inited || self.muted )
            return;
    
        if ( queuedTrackId === aTrackId && self.playing )
            return; // already playing this tune!
    
        self.stop(); // stop playing the current track (TODO : fade out?)
    
        queuedTrackId = aTrackId;
    
        SC.stream( "/tracks/" + aTrackId, ( track ) => {
            sound = track;

            if ( Config.HAS_TOUCH_CONTROLS ) {
                // on iOS we will not hear anything unless it comes
                // after a direct user response
                handler = new EventHandler();
                handler.listen( document, "touchstart", ( e ) => {
                    startPlaying();
                    handler.dispose();
                    handler = null;
                });
            }
            else {
                startPlaying();
            }
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
        if ( sound ) {
            sound.stop();
            sound = null;
        }
        if ( handler ) {
            handler.dispose();
            handler = null;
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
        while ( queuedTrackId === trackId );
    }
    else {
        trackId = tracks[ 0 ];
    }
    return trackId;
}

function startPlaying() {
    sound.play();
    self.playing = true;

    // get track META
    SC.get( "/tracks/" + queuedTrackId, ( track ) => {
        if ( track && track.user ) {
            Pubsub.publish( Messages.SHOW_MUSIC, {
                title: track.title,
                author: track.user.username
            });
        }
    });
}
