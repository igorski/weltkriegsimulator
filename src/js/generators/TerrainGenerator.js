/**
 * The MIT License (MIT)
 *
 * Igor Kogan 2015
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

    generate( MAP_WIDTH, MAP_HEIGHT, Tiles ) {
        const out = [];

        function genTerrain() {
            let x, y, i, index;
            for ( x = 0, y = 0; y < MAP_HEIGHT; x = ( ++x === MAP_WIDTH ? ( x % MAP_WIDTH + ( ++y & 0 ) ) : x ) ) {
                out.push( Tiles.WATER );
            }

            // Plant water seeds

            const WS = Math.ceil( MAP_WIDTH * MAP_HEIGHT * 0.001 );

            for ( i = 0; i < WS; i++ ) {
                x = Math.floor( Math.random() * MAP_WIDTH );
                y = Math.floor( Math.random() * MAP_HEIGHT );
                index = y * MAP_WIDTH + x;
                out[ index ] = Tiles.GRASS;
            }
            for ( i = 0; i < 4; i++ ) {
                growTerrain( out, MAP_WIDTH, MAP_HEIGHT, Tiles.GRASS );
            }

            // Plant mountain seeds

            const MS = Math.ceil( MAP_WIDTH * MAP_HEIGHT * 0.001 );

            for ( i = 0; i < MS; i++ )
            {
                x = Math.floor( Math.random() * MAP_WIDTH );
                y = Math.floor( Math.random() * MAP_HEIGHT );
                index = y * MAP_WIDTH + x;
                out[ index ] = Tiles.MOUNTAIN;
            }
            for ( i = 0; i < 3; i++ )
            {
                growTerrain( out, MAP_WIDTH, MAP_HEIGHT, Tiles.MOUNTAIN );
            }

            // sandify (creates "beaches" around water)

            for ( x = 0, y = 0; y < MAP_HEIGHT; x = ( ++x === MAP_WIDTH ? ( x % MAP_WIDTH + ( ++y & 0 ) ) : x ) )
            {
                index = y * MAP_WIDTH + x;

                if ( out[ index ] === Tiles.WATER )
                {
                    const around = getSurroundingIndicesFor( x, y, MAP_WIDTH, MAP_HEIGHT, true );
                    for ( i = 0; i < around.length; i++ )
                    {
                        if ( out[ around[ i ]] === Tiles.GRASS && Math.random() > .7 )
                        {
                            out[ index ] = Tiles.SAND;
                            break;
                        }
                    }
                }
            }
            growTerrain( out, MAP_WIDTH, MAP_HEIGHT, Tiles.SAND, 0.9 );

            // Plant some trees

            const TS = Math.ceil( MAP_WIDTH * MAP_HEIGHT * 0.1 );

            for ( i = 0; i < TS; i++ )
            {
                x     = Math.floor( Math.random() * MAP_WIDTH );
                y     = Math.floor( Math.random() * MAP_HEIGHT );
                index = y * MAP_WIDTH + x;

                if ( out[ index ] === Tiles.WATER ) {
                    out[ index ] = Tiles.TREE;
                }
            }
        }

        genTerrain();   // get crunching !

        return out;
    }
};

/**
 * grow the amount of terrain of given type on the given map
 * blatantly stolen from code by Igor Kogan
 *
 * @public
 *
 * @param {Array.<number>} map the terrain map
 * @param {number} mapWidth the width of the map
 * @param {number} mapHeight the height of the map
 * @param {number} type the terrain type to grow
 * @param {number=} optChanceThreshhold optional chance threshold for final terrain size
 */
function growTerrain( map, mapWidth, mapHeight, type, optChanceThreshhold ) {
    const threshold = optChanceThreshhold ? optChanceThreshhold : 0.7;
    let x, y, i, index;

    for ( x = 0, y = 0; y < mapHeight; x = ( ++x === mapWidth ? ( x % mapWidth + ( ++y & 0 ) ) : x ) ) {
        index = y * mapWidth + x;

        if ( map[ index ] === type ) {
            const pi = getSurroundingIndicesFor( x, y, mapWidth, mapHeight, Math.random() > .7 );

            for ( i = 0; i < pi.length; i++ ) {
                if ( Math.random() > threshold ) {
                    map[ pi[ i ] ] = type;
                }
            }
        }
    }
}

/**
 * collect surrounding indices for a given coordinate
 * blatantly stolen from code by Igor Kogan
 *
 * @public
 *
 * @param {number} x coordinate of the start point
 * @param {number} y coordinate of the point point
 * @param {number} mapWidth width of the total terrain map
 * @param {number} mapHeight height of the total terrain map
 * @param {boolean} inclDiagonals whether to include diagonals
 * @return {Array.<number>} of possible indices
 */
function getSurroundingIndicesFor( x, y, mapWidth, mapHeight, inclDiagonals ) {
    const possibleIndices = [];
    let tx, ty, nx, ny;

    for ( tx = 0, ty = 0; ty < 3; tx = ( ++tx === 3 ? ( tx % 3 + ( ++ty & 0 ) ) : tx )) {
        nx = x + tx - 1;
        ny = y + ty - 1;

        if ( nx >= 0 && ny >= 0 && nx < mapWidth && ny < mapHeight ) {
            if ( inclDiagonals ||
               ( !inclDiagonals && ( ( nx == x && ny != y ) || ( ny == y && nx != x ) ) )) {
                possibleIndices.push( ny * mapWidth + nx );
            }
        }
    }
    return possibleIndices;
}
