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
"use strict";

const Random  = require( "../util/Random" );
const Weapons = require( "../definitions/Weapons" );

module.exports = {

    /**
     * @public
     * @param {number} minClass optional minimum class/level of the Weapon
     * @return {number}
     */
    createRandomWeapon( minClass = 0 ) {
        // random value from Weapons enumeration
        return Random.range( minClass, 2 );
    },

    /**
     * apply all required properties for given Weapon type
     * onto given Ship
     *
     * @param {number} weapon from enum above
     * @param {Ship} ship
     */
    applyToActor( weapon, ship ) {
        let fireSpeed;
        // note: speeds are relative to the framerate/game cycles (60 fps)
        switch ( weapon ) {
            default:
                fireSpeed = 7;
                break;

            case Weapons.SPRAY:
                fireSpeed = 5;
                break;

            case Weapons.LASER:
                fireSpeed = 1;
                break;
        }
        ship.weapon    = weapon;
        ship.fireSpeed = fireSpeed;
    }
};
