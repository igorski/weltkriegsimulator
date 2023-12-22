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
const assetRoot  = "./assets/";
const spriteRoot = `${assetRoot}images/sprites/`;

/**
 * All assets used in the game, e.g. graphics and sound effects.
 * The image elements are appended by the AssetService during application start, these
 * image elements can be reused by all renderers (zCanvas.sprites) without the need
 * for them to each allocate a unique image per sprite type.
 */
export default {
    GRAPHICS: {
        // these will be registered directly inside zCanvas to be referenced by the renderers

        POWERUP      : { src: `${spriteRoot}spritesheet_powerups.png`, id: "powerup" },
        SHIP         : { src: `${spriteRoot}spritesheet_ship.png`,     id: "ship" },
        BOSS         : { src: `${spriteRoot}spritesheet_boss.png`,     id: "boss" },
        FX           : { src: `${spriteRoot}spritesheet_fx.png`,       id: "fx" },
        SKY          : { src: `${spriteRoot}clouds.png`,               id: "sky" },
        BULLET       : { src: `${spriteRoot}bullet.png`,               id: "bullet" },

        // these will be loaded as Images as we will use them as sources to generate tiles with

        WATER        : { src: `${spriteRoot}spritesheet_water.png`,    img: null },
        TILE         : { src: `${spriteRoot}tile.png`,                 img: null },
        ISLAND       : { src: `${spriteRoot}tilesheet_island.png`,     img: null }
    },

    AUDIO: {
        AU_EXPLOSION : `${assetRoot}sounds/explosion.mp3`,
        AU_LASER     : `${assetRoot}sounds/laser.mp3`
    }
};
