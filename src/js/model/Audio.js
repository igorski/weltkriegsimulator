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
import axios        from "axios";
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
let trackMeta     = {}; // soundcloud track data
const handler     = new EventHandler();

let audioContext, filter, effectsBus, masterBus, explosion, laser;

const Audio = {

    muted: false,

    /**
     * @public
     * Must be called on user interaction to trigger unmute on iOS
     */
    init() {
        if ( inited ) {
            return;
        }
        inited = true;

        setupWebAudioAPI();

        // prepare the sound effects
        explosion = createAudioElement( Assets.AUDIO.AU_EXPLOSION, effectsBus );
        laser     = createAudioElement( Assets.AUDIO.AU_LASER, effectsBus );

        // enqueue the first track for playback
        Audio.enqueueTrack();

        Pubsub.subscribe( Messages.IMPACT, Audio.playSoundFX.bind( Audio, Assets.AUDIO.AU_EXPLOSION ));
        Pubsub.subscribe( Messages.FIRE,   Audio.playSoundFX.bind( Audio, Assets.AUDIO.AU_LASER ));
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
    async enqueueTrack( optReadyCallback ) {
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
        // this will not actually play the track yet (see playEnqueuedTrack())

        Audio.stop();

        const requestData = {
            headers: {
                "Content-Type"  : "application/json; charset=utf-8",
                "Authorization" : `OAuth ${Config.getSoundCloudClientId()}`
            }
        };

        let { data } = await axios.get( `https://api.soundcloud.com/tracks/${trackId}`, requestData );
        if ( data?.access === "playable" && data.stream_url ) {
            trackMeta = data;
            // data.stream_url should be the way to go but this leads to CORS errors when following
            // a redirect... for now use the /streams endpoint
            ({ data } = await axios.get( `https://api.soundcloud.com/tracks/${trackId}/streams`, requestData ));
            if ( data?.http_mp3_128_url ) {
                sound = createAudioElement( data.http_mp3_128_url, masterBus, true );
                optReadyCallback?.();
            }
        }
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
        _startPlayingEnqueuedTrack();
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

    // show track META
    if ( trackMeta?.user ) {
        setTimeout(() => {
            Pubsub.publish( Messages.SHOW_MESSAGE, Copy.applyData( "MUSIC", [
                trackMeta.title, trackMeta.user.username
            ]));
        }, 1000 );
    }
}

function createAudioElement( source, bus = null, loop = false ) {
    const element = document.createElement( "audio" );
    element.crossOrigin = "anonymous";
    element.setAttribute( "src", source );

    if ( loop ) {
        element.setAttribute( "loop", "loop" );
    }

    // connect sound to AudioContext when supported
    if ( bus ) {
        acSound = audioContext.createMediaElementSource( element );
        acSound.connect( bus );
    }
    return element;
}

async function wavToBuffer( path ) {
    return new Promise(( resolve, reject ) => {
        const request = new XMLHttpRequest();
        request.open( "GET", path );
        request.responseType = "arraybuffer";
        request.onload = () => {
            audioCtx.decodeAudioData( request.response, buffer => {
                const source  = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect( masterBus );
                resolve( source );
            });
        };
        request.onerror = reject;
        request.send();
    });
}

function nextTrack() {
    handler.dispose();
    Audio.enqueueTrack( Audio.playEnqueuedTrack );
}

function playSoundFX( audioElement ) {
    audioElement.currentTime = 0;
    // randomize pitch to prevent BOREDOM
    if ( effectsBus ) {
        effectsBus.detune.value = -1200 + ( Math.random() * 2400 ); // in -1200 to +1200 range
    }
    if ( !audioElement.paused || audioElement.currentTime ) {
        audioElement.currentTime = 0; // audio was paused/stopped
    } else {
        audioElement.play();
    }
}

// modern browsers with WebAudio API can enjoy filtering effects on the audio
// we use this to dull out the sound when switching layers

function setupWebAudioAPI() {
    const acConstructor = window.AudioContext || window.webkitAudioContext;
    if ( typeof acConstructor !== "undefined" ) {
        audioContext = new acConstructor();
        // a "channel strip" to connect all audio nodes to
        masterBus = audioContext.createGain();
        // a bus for all sound effects (biquad filter allows detuning)
        effectsBus = audioContext.createBiquadFilter();
        effectsBus.connect( masterBus );
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
