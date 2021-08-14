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
import Pubsub       from "pubsub-js";
import Config       from "@/config/Config";
import Assets       from "@/definitions/Assets";
import Copy         from "@/definitions/Copy";
import AudioTracks  from "@/definitions/AudioTracks";
import Messages     from "@/definitions/Messages";
import EventHandler from "@/util/EventHandler";

let inited        = false;
let playing       = false;
let sound         = null; // HTML <audio> element
let acSound       = null; // WebAudio wrapper for sound Element
let queuedTrackId = null;
const handler     = new EventHandler();

let audioContext, filter, masterBus, explosion, laser;

const Audio = {

    muted: false,

    /**
     * @public
     */
    init() {
        if ( inited || !( "SC" in window )) {
            return;
        }

        debouncedSetup(() => {
            SC.initialize({
                client_id: Config.getSoundCloudClient()
            });
            inited = true;

            setupWebAudioAPI();

            // prepare the sound effects
            explosion = createAudioElement( Assets.AUDIO.AU_EXPLOSION );
            laser     = createAudioElement( Assets.AUDIO.AU_LASER );

            // enqueue the first track for playback
            Audio.enqueueTrack();
        });
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
        if ( !inited || Audio.muted ) {
            return;
        }
        const trackId = _getTrackIdFromPool();
        if ( queuedTrackId === trackId ) {
            return;
        }
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

        if ( !inited || Audio.muted ) {
            return;
        }
        if ( Config.HAS_TOUCH_CONTROLS ) {
            debouncedSetup(() => {
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
            if ( audioContext ) {
                acSound.disconnect();
                acSound = null;
            }
            sound.pause();
            sound = null;
        }
        handler.dispose();
        playing = false;
    },

    setFrequency( value = 22050 ) {
        if ( audioContext ) {
            filter.frequency.cancelScheduledValues( audioContext.currentTime );
            filter.frequency.linearRampToValueAtTime( value, audioContext.currentTime + 1.25 )
        }
    }
};
export default Audio;

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
        if ( track && track.user ) {
            Pubsub.publish( Messages.SHOW_MESSAGE, Copy.applyData( "MUSIC", [
                track.title, track.user.username
            ]));
        }
    });
}

function createAudioElement( source ) {
    const element = document.createElement( "audio" );
    element.crossOrigin = "anonymous";
    element.setAttribute( "src", source );

    // connect sound to AudioContext when supported
    if ( audioContext ) {
        acSound = audioContext.createMediaElementSource( element );
        acSound.connect( masterBus );
    }
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

// modern browsers with WebAudio API can enjoy filtering effects on the audio
// we use this to dull out the sound when switching layers

function setupWebAudioAPI() {
    const acConstructor = window.AudioContext || window.webkitAudioContext;
    if ( typeof acConstructor !== "undefined" ) {
        audioContext = new acConstructor();
        // a "channel strip" to connect all audio nodes to
        masterBus = audioContext.createGain();
        // a low-pass filter to apply onto the master bus
        filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        masterBus.connect( filter );
        // filter connects to the output so we can actually hear stuff
        filter.connect( audioContext.destination );
        // set default frequency of filter
        Audio.setFrequency();
    }
}

// WebAudio API is only allowed to start after a user interaction

function debouncedSetup( callback ) {
    const handler = () => {
        setupHandler.dispose();
        callback();
    };
    const setupHandler = new EventHandler();
    setupHandler.listen( document, "keyup", handler );
    setupHandler.listen( document, "click", handler );
}
