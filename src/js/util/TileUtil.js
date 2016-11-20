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
     * create a random tile map from given aImage / image source
     * (should be a single tile that can be assembled in
     * a repeatable pattern)
     *
     * @public
     *
     * @param {string|Image} aImage
     * @param {number=} aScale
     * @return {Promise}
     */
    createTileMap( aImage, aScale ) {

        if ( typeof aImage === "string" ) {

            const src = aImage;
            aImage = new Image();
            aImage.src = src;
        }
        aScale = ( typeof aScale === "number" ) ? aScale : 1;

        return new Promise(( resolve, reject ) => {

            onReady( aImage, () => {

                const tileWidth = aImage.width * aScale;
                const tileHeight = aImage.height * aScale;

                const horAmount = Math.round( Math.random() * 25 );
                const verAmount = Math.round( Math.random() * 15 );

                const cvs = document.createElement( "canvas" );
                const ctx = cvs.getContext( "2d" );
                cvs.width = horAmount * tileWidth;
                cvs.height = verAmount * tileHeight;

                for ( let col = 0; col < horAmount; ++col ) {
                    for ( let row = 0; row < verAmount; ++row ) {

                        if ( Math.random() < .2 )
                            continue;

                        ctx.drawImage(
                            aImage,
                            row * tileWidth, col * tileHeight,
                            tileWidth, tileHeight
                        )
                    }
                }
                resolve( cvs );
            });
        });
    }
};

function onReady( aImage, callback ) {

    const ITERATIONS = 32;
    let tries = ITERATIONS;
    const check = function() {
        if ( aImage.complete && aImage.naturalWidth > 0 ) {
            callback();
        }
        else {
            if ( --tries > 0 )
                requestAnimationFrame( check );
            else
                throw new Error( "Image didn't reach ready state after " + ITERATIONS + " iterations" );
        }
    };
    check();
}
