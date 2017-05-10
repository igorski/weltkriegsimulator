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
"use strict";

const zCanvas          = require( "zcanvas" );
const Assets           = require( "../definitions/Assets" );
const TerrainGenerator = require( "../generators/TerrainGenerator" );

/**
 * the tile types for rendering a World
 *
 * @public
 * @const
 * @type {Object}
 */
const Tiles = {
    GRASS: 0,
    SAND: 1,
    WATER: 2,
    MOUNTAIN: 3,
    TREE: 4
};

const Terrain = module.exports = {

    WORLD: new Image(),

    render() {
        console.log( "RENDER WORLD COMMAND" );

        const world = {
            width: 20,
            height: 40
        };
        const worldWidth = world.width, worldHeight = world.height;
        const tileWidth  = 20;
        const tileHeight = 20;
        const terrain    = TerrainGenerator.generate( worldWidth, worldHeight, Tiles );

        // setup Canvas for rendering

        const cvs = document.createElement( "canvas" );
        const ctx = cvs.getContext( "2d" );

        cvs.width  = tileWidth  * worldWidth;
        cvs.height = tileHeight * worldHeight;

        // we render the above coordinates, with addition of one extra
        // tile outside of the tiles (prevents blank screen during movement)

        const rl = 0, rr = worldWidth;
        const rt = 0, rb = worldHeight;

        let i, j, l, x, y;

        const onReady = function() {
            // store the result

            // TODO : investigate https://github.com/imaya/CanvasTool.PngEncoder for 8-bit PNG ?

            Terrain.WORLD.src    = cvs.toDataURL( "image/png" );
            Terrain.WORLD.width  = cvs.width;
            Terrain.WORLD.height = cvs.height;

            zCanvas.loader.onReady( Terrain.WORLD, () => {
                console.warn("do smth");
            });
        };

        // function to render the sprites onto the Canvas

        function render( aIteration ) {
            // rows first

            for ( i = aIteration, l = aIteration + 1; i < l; ++i )    // a row
            {
                for ( j = rl; j < rr; ++j ) // all columns within a row
                {
                    x = j * tileWidth;
                    y = i * tileHeight;

                    TerrainRenderer.drawTileForSurroundings( ctx, j, i, x, y, terrain, world );
                }
            }
        }

        // TODO : separate into individual tiles for mobile !!

        // here we define our own custom override of the ZThread internal execution handler to
        // render all columns of a single row, one by ony

        const MAX_ITERATIONS = rb;    // all rows

        for ( let i = 0; i < MAX_ITERATIONS; ++i ) {
            render( i );
        }
        onReady();
    }
};


const TerrainRenderer =
{
    /**
     * draws a tile taking the surrounding tiles into account for an aesthetically
     * pleasing result by linking the adjacent tiletypes
     *
     * @param {CanvasRenderingContext2D} ctx to draw on
     * @param {number} tx x index of the tile in the terrain map
     * @param {number} ty y index of the tile in the terrain map
     * @param {number} x targetX to draw the tile at on the ctx
     * @param {number} y targetY to draw the tile at on the ctx
     * @param {Array.<number>} terrain the terrain we're drawing from
     * @param {{width: number, height: number}} world
     */
    drawTileForSurroundings( ctx, tx, ty, x, y, terrain, world ) {

        const tile     = getTileDescription( tx, ty, terrain, world );
        const tileType = tile.type;

        switch ( tileType )
        {
            default:
            case Tiles.GRASS:
                drawTile( ctx, getSheet( tile ), 0, x, y ); // grass is the default World underground
                break;

            case Tiles.SAND:
            case Tiles.WATER:
            case Tiles.MOUNTAIN:
                drawTile( ctx, getSheet( tile ), 0, x, y ); // draw tile underground first
                drawAdjacentTiles( tile, tx, ty, x, y, world, terrain, ctx );
                break;

            case Tiles.TREE: // tree
                drawTile( ctx, Assets.GRAPHICS.TREE.target,  0, x, y ); // tree second
                break;
        }
    }
};

/* internal methods */

/**
 * actual rendering of a single tile onto the canvas
 *
 * @param {CanvasRenderingContext2D} aCanvasContext to draw on
 * @param {Image} aBitmap source spritesheet
 * @param {number} tileSourceX source x-coordinate of the tile (relative
 *                 to its spritesheet aBitmap)
 * @param {number} targetX target x-coordinate of the tile inside the given context
 * @param {number} targetY target y-coordinate of the tile inside the given context
 */
function drawTile( aCanvasContext, aBitmap, tileSourceX, targetX, targetY )
{
    if ( tileSourceX < 0 || !aBitmap )
        return;

    aCanvasContext.drawImage( aBitmap,
                              tileSourceX, 0,   TILE_SIZE, TILE_SIZE,
                              targetX, targetY, TILE_SIZE, TILE_SIZE );
}

/**
 * get the sprite value for a given tile
 * returns the tile type (determines the sprite sheet)
 * and the the visible area of the tile (see enumeration below)
 *
 * @param {number} tx x-coordinate of the tile
 * @param {number} ty y-coordinate of the tile
 * @param {Array.<number>} terrain the terrain the tile resides in
 * @param {{width: number, height: number}} world
 * @param {boolean=} blockRecursion optionally block recursion, defaults to false
 *
 * @return {{ type: number, area: number }}
 */
function getTileDescription( tx, ty, terrain, world, blockRecursion ) {

    const width = world.width, maxX = width - 1, maxY = world.height - 1;
    const tile  = terrain[ ty * width + tx ];
    const out   = { type : tile, area : FULL_SIZE };

    const tileLeft       = tx > 0 ?    terrain[ ty * width + ( tx - 1 ) ] : 0;
    const tileRight      = tx < maxX ? terrain[ ty * width + ( tx + 1 ) ] : 0;
    const tileAbove      = ty > 0 ?    terrain[( ty - 1 ) * width + tx ]  : 0;
    const tileBelow      = ty < maxY ? terrain[( ty + 1 ) * width + tx ]  : 0;
    const tileAboveLeft  = tx > 0 && ty > 0    ? terrain[( ty - 1 ) * width + ( tx - 1 )] : 0;
    const tileAboveRight = tx < maxX && ty > 0 ? terrain[( ty - 1 ) * width + ( tx + 1 )] : 0;

    // inner corner types first

    if ( tileLeft === tile && tileAbove === tile &&
         equalOrPassable( tile, tileRight ) && tileAboveRight !== tile )
    {
        if ( getTileDescription( tx - 1, ty, terrain, world, true ).area === TOP_LEFT )
            out.area = EMPTY_LEFT;
        else if ( tileBelow !== tile )
            out.area = EMPTY_TOP_LEFT;
        else
            out.area = EMPTY_LEFT;

        return out;
    }

    if ( equalOrPassable( tile, tileLeft ) && tileAbove === tile &&
         tileRight === tile && tileAboveLeft !== tile )
    {
        if ( tileBelow === tile )
            out.area = EMPTY_RIGHT;
        else
            out.area = EMPTY_TOP_RIGHT;

        return out;
    }

    if ( tileRight === tile && equalOrPassable( tile, tileBelow ) && tileAbove === tile ) {
        out.area = EMPTY_TOP_RIGHT;
        return out;
    }

    // vertical types

    if ( tileLeft !== tile && tileBelow === tile && equalOrPassable( tile, tileRight ))
    {
        out.area = EMPTY_LEFT;
        return out;
    }

    if ( tileRight !== tile && tileBelow === tile && equalOrPassable( tile, tileLeft ))
    {
        out.area = EMPTY_RIGHT;
        return out;
    }

    // horizontal types

    if ( tileLeft === tile && tileRight === tile )
    {
        if ( tileAbove === tile )
        {
            if ( getTileDescription( tx - 1, ty, terrain, world, true ).area === EMPTY_RIGHT )
            {
                if ( !blockRecursion && getTileDescription( tx + 2, ty, terrain, world, true ).area === FULL_SIZE )
                    out.area = BOTTOM_RIGHT;
                else
                    out.area = EMPTY_LEFT;
            }
            else
                out.area = EMPTY_TOP;
        }
        else if ( equalOrPassable( tile, tileAbove ))
            out.area = EMPTY_BOTTOM;

        return out;
    }
    return out;
}

function drawAdjacentTiles( tile, tx, ty, x, y, env, terrain, ctx ) {
    const width    = env.width, maxX = width - 1, maxY = env.height - 1;
    const tileType = tile.type;

    // get the surrounding tiles

    const tileLeft       = tx > 0 ?                 getTileDescription( tx - 1, ty,     terrain, env ) : 0;
    const tileRight      = tx < maxX ?              getTileDescription( tx + 1, ty,     terrain, env ) : 0;
    const tileAbove      = ty > 0 ?                 getTileDescription( tx,     ty - 1, terrain, env ) : 0;
    const tileBelow      = ty < maxY ?              getTileDescription( tx,     ty + 1, terrain, env ) : 0;

    // alters the input tile t depending on its surroundings
    // it should be exchanged for a different tile

    function sanitize( t ) {
        // trees should act as grass when used to connect adjacent tiles

        if ( t.type === Tiles.TREE )
            t.type = Tiles.GRASS;

        return t;
    }

    if ( tileLeft && tileLeft.type !== tileType )
        drawTile( ctx, getSheet( sanitize( tileLeft )), 120, x, y );

    if ( tileRight && tileRight.type !== tileType )
        drawTile( ctx, getSheet( sanitize( tileRight )), 100, x, y );

    if ( tileAbove && tileAbove.type !== tileType )
        drawTile( ctx, getSheet( sanitize( tileAbove )), 160, x, y );

    if ( tileBelow && tileBelow.type !== tileType )
        drawTile( ctx, getSheet( sanitize( tileBelow )), 140, x, y );
}

/**
 * retrieve the spritesheet for given tileDescription for given environment
 *
 * @param {{ type: number, area: number }} tileDescription
 * @return {Image}
 */
function getSheet( tileDescription ) {
    switch ( tileDescription.type ) {
        default:
        case Tiles.GRASS:
            return Assets.GRAPHICS.GRASS.target;

        case Tiles.SAND:
            return Assets.GRAPHICS.SAND.target;

        case Tiles.WATER:
            return null;

        case Tiles.MOUNTAIN:
            return Assets.GRAPHICS.ROCK.target;

        case Tiles.TREE:
            return Assets.GRAPHICS.TREE.target;
    }
}

/**
 * query whether given tile of type tileToCompare is equal to
 * given tile of type compareTile or is of a passable type
 *
 * @param {number} compareTile
 * @param {number} tileToCompare
 * @return {boolean}
 */
function equalOrPassable( compareTile, tileToCompare ) {
    return tileToCompare === compareTile || tileToCompare === Tiles.GRASS || tileToCompare === Tiles.SAND;
}

const TILE_SIZE = 20; // size of a single tile (in pixels, tiles are squares)

// the visible area a tile can occupy, the spritesheets
// should store these tiles in this order

const FULL_SIZE          = 0,
    BOTTOM_RIGHT       = 1,
    BOTTOM_LEFT        = 2,
    TOP_RIGHT          = 3,
    TOP_LEFT           = 4,
    EMPTY_LEFT         = 5,
    EMPTY_RIGHT        = 6,
    EMPTY_TOP          = 7,
    EMPTY_BOTTOM       = 8,
    EMPTY_BOTTOM_RIGHT = 9,
    EMPTY_BOTTOM_LEFT  = 10,
    EMPTY_TOP_RIGHT    = 11,
    EMPTY_TOP_LEFT     = 12;
