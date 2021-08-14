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
const STORAGE_KEY = "wks.settings";
let configuration;

/**
 * model that manages the list of
 * high scores within LocalStorage
 */
const Settings = {

    /**
     * Storable properties
     */
    PROPS: {
        HAS_PLAYED  : "hp",
        MUSIC_ON    : "me"
    },

    /**
     * initialize the model, this also
     * fetches previously stored settings from LocalStorage
     */
    init() {
        retrieve();
    },

    /**
     * retrieve a setting from the configuration
     *
     * @param {string} property name of property to retrieve
     * @return {*}
     */
    get( property ) {
        return configuration[ property ];
    },

    /**
     * saves given property and its value into the
     * configuration
     *
     * @param {string} property
     * @param {*} value
     */
    set( property, value ) {
        configuration[ property ] = value;
        save();
    }
};
export default Settings;

function retrieve() {
    try {
        const data = localStorage.getItem( STORAGE_KEY );
        if ( data ) {
            configuration = JSON.parse( data );
            return;
        }
    }
    catch ( e ) {}
    configuration = createDefaultConfiguration();
}

function save() {
    try {
        localStorage.setItem( STORAGE_KEY, JSON.stringify( configuration ));
        return true;
    }
    catch ( e ) {}
    return false;
}

function createDefaultConfiguration() {
    const out = {};
    
    out[ Settings.PROPS.HAS_PLAYED ] = false;
    // note we mute audio when in local dev mode
    out[ Settings.PROPS.MUSIC_ON ]   = process.env.NODE_ENV !== "development";

    return out;
}
