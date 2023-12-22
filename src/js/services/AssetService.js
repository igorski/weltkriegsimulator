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
import { Loader } from "zcanvas";
import Assets from "@/definitions/Assets";

export default {

    /**
     * @param {Canvas} canvas
     * @return {Promise<void>}
     */
    prepare( canvas ) {

        // load all graphic Assets

        const graphics = Object.values( Assets.GRAPHICS );
        return new Promise( async ( resolve, reject ) => {
            let pending = graphics.length;
            for ( let i = 0; i < pending; ++i ) {
                const entry = graphics[ i ];
                try {
                    if ( entry.id ) {
                        await canvas.loadResource( entry.id, entry.src );
                    } else if ( entry.img !== undefined ) {
                        const { image } = await Loader.loadImage( entry.src );
                        entry.img = image;
                    }
                } catch ( e ) {
                    reject( e );
                }
            }
            // cache pixel map for collision detection
            canvas.collision.cache( Assets.GRAPHICS.SHIP.id );

            resolve();
        });
    }
};
