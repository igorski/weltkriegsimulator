/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016 - http://www.igorski.nl
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

module.exports = {

    /**
     * change the value of given property of given actor
     * to targetValue over a time of delayTime seconds
     *
     * @param {Ship} actor
     * @param {string|Array.<string>} property single String or Array of Strings
     * @param {number|Array.<number>} targetValue single number or Array of numbers
     * @param {number} delayTime in seconds
     * @param {Function=} optCallback optional callback to execute when ready
     * @param {Function=} optEase optional easing function to use
     * @param {Function=} optUpdate optional method to execute while Tween
     *                    updates on each interation of its execution
     */
    setDelayed( actor, property, targetValue, delayTime, optCallback, optEase, optUpdate ) {

        const vars = {
            onComplete: optCallback
        };

        if ( optUpdate )
            vars.onUpdate = optUpdate;

        if ( Array.isArray( property )) {
            for ( let i = 0, l = property.length; i < l; ++i )
                vars[ property[ i ]] = targetValue[ i ];
        }
        else {
            vars[ property ] = targetValue;
        }
        if ( optEase ) {
            vars[ "ease" ] = optEase;
        }

        TweenMax.to(
            actor, delayTime, vars
        );
    }
};
