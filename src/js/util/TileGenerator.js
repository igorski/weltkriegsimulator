/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2016-2017 - http://www.igorski.nl
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
import Assets           from "@/definitions/Assets";
import { createCanvas } from "@/util/CanvasUtil";
import Random           from "@/util/Random";

const ISLAND = {
    // x-coordinates within sheet for each tile
    // separated by top, middle and lower sections
    // each section contains an array of left, center and right tile
    top    : [ 0, 16, 32 ],
    middle : [ 48, 64, 80 ],
    bottom : [ 96, 112, 128 ],
    // vertical top and bottom tile (fades grass into sea)
    rocks  : [ 144, 160 ],
    // multi-tile decorative graphics
    decorations: {
        rock    : { x: 0,    y: 16, tileAmount: 1 },
        tree    : { x: 176,  y: 0,  tileAmount: 4 },
        bunker  : { x: 16, y: 16, tileAmount: 2 },
        scenery : { x: 48, y: 16, tileAmount: 2 }
    }
};

/**
 * Utility to create randomized sprites made up of multiple
 * randomly placed tiles. Just to add some visual interest to
 * the game and unique sprites for each session. It's a bit of code
 * but still smaller than packaging several variants of pre-fab sheets.
 */
export default {

    /**
     * create a randomized structure from the stone tile asset
     *
     * @param {number=} scale
     */
    createTileMap( scale = 1 ) {
        const tile = Assets.GRAPHICS.TILE.img;
        scale = ( typeof scale === "number" ) ? scale : 1;

        const tileWidth  = Math.round( tile.width  * scale );
        const tileHeight = Math.round( tile.height * scale );

        const horAmount = Math.ceil( Math.random() * 25 );
        const verAmount = Math.ceil( Math.random() * 15 );

        const { cvs, ctx } = createCanvas( horAmount * tileWidth, verAmount * tileHeight );

        for ( let col = 0; col < horAmount; ++col ) {
            for ( let row = 0; row < verAmount; ++row ) {
                if ( Math.random() < 0.2 ) {
                    continue; // some holes for variation
                }
                ctx.drawImage(
                    tile,
                    row * tileWidth, col * tileHeight,
                    tileWidth, tileHeight
                );
            }
        }
        return cvs;
    },

    /**
     * create a random island from the respective tilesheet
     *
     * @param {number=} scale
     */
    createIslandTileMap( scale = 1 ) {
        // tilesheet contains tiles of 16x16 pixels size

        const tileWidth  = Math.round( 16 * scale );
        const tileHeight = Math.round( 16 * scale );

        const horAmount = Math.ceil( Math.random() * 25 ) + 20;
        const verAmount = Math.ceil( Math.random() * 15 ) + 20;

        const { cvs, ctx } = createCanvas( horAmount * tileWidth, verAmount * tileHeight );

        // first create a matrix of all inner islands

        const matrix = {};
        createIsland( 0, 0, horAmount, verAmount - 3, matrix );

        const bitmap = Assets.GRAPHICS.ISLAND.img;

        // draw matrix onto canvas using the appropriate corner tile types
        for ( let x = 0; x < horAmount; ++x ) {
            if ( !matrix[ x ]) {
                continue; // no vertical content at this x-coordinate
            }
            let firstTile = Infinity; // y coordinate of the first tile within this row
            let stoneRow  = 0;
            for ( let y = 0; y < verAmount; ++y ) {
                const draw = matrix[ x ][ y ]; // whether there is a tile to render at this coordinate
                if ( !draw ) {
                    // reached bottom tile ? render two rows of stones below
                    if ( y > firstTile && stoneRow < 2 ) {
                        ctx.drawImage(
                            bitmap, ISLAND.rocks[ stoneRow ], 0, 16, 16,
                            x * tileWidth, y * tileHeight, tileWidth, tileHeight
                        );
                        ++stoneRow;
                    }
                    continue;
                } else {
                    firstTile = y;
                    stoneRow  = 0;
                }

                const {
                    hasTileAbove, hasTileBelow, hasTileLeft, hasTileRight
                } = hasSurroundings( matrix, x, y );

                let list = hasTileAbove ? ISLAND.bottom : ISLAND.top;
                if ( hasTileAbove && hasTileBelow ) {
                    list = ISLAND.middle;
                }
                let index = hasTileLeft ? 2 : 0;
                if ( hasTileLeft && hasTileRight ) {
                    index = 1;
                }
                ctx.drawImage(
                    bitmap,
                    list[ index ], 0, 16, 16,
                    x * tileWidth, y * tileHeight, tileWidth, tileHeight
                );
            }
        }
        // draw some scenery
        for ( let i = 20; i > 0; --i ) {
            const x = Math.max( 4, Math.floor( Math.min( Math.random() * horAmount, horAmount - 6 )));
            const y = Math.max( 0, Math.floor( Math.min( Math.random() * verAmount, verAmount - 10 )));
            const {
                hasTileAbove, hasTileBelow, hasTileLeft, hasTileRight
            } = hasSurroundings( matrix, x, y );
            if ( hasTileLeft && hasTileAbove && hasTileBelow && hasTileRight && Random.bool() ) {
                const decoration = ISLAND.decorations[ Random.from([ "rock", "tree", "bunker", "scenery" ]) ];
                ctx.drawImage(
                    bitmap, decoration.x, decoration.y, 16 * decoration.tileAmount, 16 * decoration.tileAmount,
                    x * tileWidth, y * tileHeight, tileWidth * decoration.tileAmount, tileHeight * decoration.tileAmount
                );
            }
        }
        return cvs;
    }
};

function createIsland( startX, startY, width, maxHeight, matrix ) {
    const minHeight = maxHeight - 1;
    for ( let x = Math.round( startX ); x < startX + width; ++x ) {
        const atEdge = x < 2 || x > ( width - 3 );
        for ( let y = Math.round( startY ); y < startY + maxHeight; ++y ) {
            if ( y > minHeight && Random.bool() ) {
                break; // randomize height
            }
            if ( atEdge && Random.bool() ) {
                continue; // randomize widths around edges
            }
            if ( !matrix[ x ]) {
                matrix[ x ] = {};
            }
            matrix[ x ][ y ] = true;
        }
    }
}

function hasSurroundings( matrix, x, y ) {
    return {
        hasTileAbove : matrix[ x ]?.[ y - 1 ],
        hasTileBelow : matrix[ x ]?.[ y + 1 ],
        hasTileLeft  : matrix[ x - 1 ]?.[ y ],
        hasTileRight : matrix[ x + 1 ]?.[ y ]
    };
}
