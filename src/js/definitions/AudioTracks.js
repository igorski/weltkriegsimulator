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
const AudioTracks =
{
    /**
     * Track ids of music on SoundCloud
     *
     * (you can retrieve a SoundCloud identifier by clicking "Share" on the track page,
     * selecting "Embed" and retrieving the numerical value from the URL)
     */
    THEME_1 : "300767985",
    THEME_2 : "222536433",

    /**
     * convenience method to return a list of all track ids
     * listed in this Object
     *
     * @public
     * @return {Array<string>}
     */
    getAll() {
        const out = [];
        Object.keys( AudioTracks ).forEach(( key ) => {
            if ( typeof AudioTracks[ key ] !== "function" )
                out.push( AudioTracks[ key ] );
        });
        return out;
    }
};
export default AudioTracks;
