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
const Copy = {

    /**
     * copy can be either string, Array<string> or an Object
     * w/ separate "title" and "body" string (for
     * instance for displaying messages w/ title header)
     */
    BONUS  : `+{0} pts.`,
    ENERGY : `Energy restored`,
    WEAPONS: [ `Bullet`, `Bullet spray`, `Laser` ],
    WEAPON : `Equipped {0}`,

    TUTORIAL: {
        KEYBOARD: [
            { text: `Move your ship using the arrow keys (or WASD)`, timeout: 0 },
            { text: `Press the spacebar to shoot`,                   timeout: 5 },
            { text: `Use the Z key to change vertical plane`,        timeout: 4 }
        ],
        TOUCH: [
            { text: `Steer your ship using the control stick on the bottom left`, timeout: 0 },
            { text: `Press the right button to fire`,                             timeout: 5 },
            { text: `Press the left button to change vertical plane`,             timeout: 4 }
        ]
    },

    MUSIC: {
        title: `Now playing:`,
        body : `{0} by {1}`
    },

    /**
     * @public
     * @param {string} copyKey of above enumeration
     * @param {string|Array<string>=} optDataReplacement with values to replace in above strings,
     *        either single string for single {0} replacement, or Array<string> for {0}, {1}, {2}, etc..
     * @return {string}
     */
    applyData( copyKey, optDataReplacement ) {

        const text = Copy[ copyKey ], isPrimitive = typeof text === "string";

        // create a deep copy of primitive values

        let titleData = ( isPrimitive ) ? text : text.title;
        let bodyData  = ( isPrimitive ) ? null : text.body;

        if ( Array.isArray( optDataReplacement )) {
            optDataReplacement.forEach(( replacement, index ) => {
                bodyData = bodyData.replace( `{${index}}`, replacement );
            });
        }
        else if ( typeof optDataReplacement === "string" || typeof optDataReplacement === "number" ) {
            titleData = titleData.replace( `{0}`, optDataReplacement );
        }
        return {
            title: titleData,
            body : bodyData
        };
    }
};
export default Copy;
