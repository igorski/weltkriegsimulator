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
const Assets       = require( "../definitions/Assets" );
const AudioTracks  = require( "../definitions/AudioTracks" );
const Messages     = require( "../definitions/Messages" );
const Pubsub       = require( "pubsub-js" );
const EventHandler = require( "../util/EventHandler" );

let inited        = false;
let playing       = false;
let sound         = null; // HTML <audio> element
let queuedTrackId = null;
let handler       = new EventHandler();
let explosion, laser;

const Audio = module.exports = {

    muted: false, // window.location.href.indexOf( "localhost" ) === -1,

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

        explosion = createAudioElement( Assets.AUDIO.AU_EXPLOSION );
        laser     = createAudioElement( Assets.AUDIO.AU_LASER );

        // enqueue the first track for playback
        Audio.enqueueTrack();
    },

    /**
     * @public
     * @param {string} effect asset path
     */
    playSoundFX( effect ) {
        if ( inited && !Audio.muted ) {
            switch ( effect ) {
                case Assets.AUDIO.AU_EXPLOSION:
                    playSoundFX( explosion );
                    break;

                case Assets.AUDIO.AU_LASER:
                    playSoundFX( laser );
                    break;
            }
        }
    },
    
    /**
     * enqueue a track from the available pool for playing
     */
    enqueueTrack() {
        if ( !inited || Audio.muted )
            return;

        const trackId = _getTrackIdFromPool();
    
        if ( queuedTrackId === trackId  )
            return;
    
        queuedTrackId = trackId;

        // prepare the stream from SoundCloud, we create an inline <audio> tag instead
        // of using SC stream to overcome silence on mobile devices (looking at you, Apple!)
        // this will thus not actually play the track (see playEnqueuedTrack())

        Audio.stop();
        sound = createAudioElement(
            `https://api.soundcloud.com/tracks/${trackId}/stream?client_id=${Config.SOUNDCLOUD_CLIENT_ID}`
        );
    },

    /**
     * play the music! note this is proxied via a user action
     * (click on document) to overcome total silence on
     * mobile devices
     *
     * @public
     */
    playEnqueuedTrack() {

        if ( !inited || Audio.muted )
            return;

        if ( Config.HAS_TOUCH_CONTROLS ) {
            // on iOS we will not hear anything unless it comes
            // after a direct user response
            handler.listen( document, "touchstart", ( e ) => {
                handler.dispose();
                _startPlayingEnqueuedTrack();
            });
        }
        else {
            _startPlayingEnqueuedTrack();
        }
    },

    /**
     * stops playing all tracks
     *
     * @public
     */
    stop() {
        if ( sound ) {
            sound.pause();
            sound = null;
        }
        handler.dispose();
        playing = false;
    }
};

/* private methods */

function _getTrackIdFromPool() {
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

function _startPlayingEnqueuedTrack() {

    if ( !sound )
        return;

    try {
        sound.play();
    }
    catch ( e ) {
        // no supported sources
        nextTrack();
        return;
    }

    playing = true;

    // when song ends, enqueue and play the next one in the pool

    handler.listen( sound, "ended", ( e ) => {
        nextTrack();
    });

    // get track META
    SC.get( "/tracks/" + queuedTrackId, ( track ) => {
        console.warn("playing " + queuedTrackId);
        if ( track && track.user ) {
            Pubsub.publish( Messages.SHOW_MUSIC, {
                title: track.title,
                author: track.user.username
            });
        }
    });
}

function createAudioElement( source ) {
    const element = document.createElement( "audio" );
    element.setAttribute( "src", source );

    return element;
}

function nextTrack() {
    handler.dispose();
    Audio.enqueueTrack();
    Audio.playEnqueuedTrack();
}

function playSoundFX( audioElement ) {
    audioElement.currentTime = 0;
    audioElement.play();
}
