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

/* actors */

import Bullet  from "@/model/actors/Bullet";
import Powerup from "@/model/actors/Powerup";
import Ship    from "@/model/actors/Ship";
import Enemy   from "@/model/actors/Enemy";
import Boss    from "@/model/actors/Boss";

/* renderers */

import BulletRenderer  from "@/view/renderers/BulletRenderer";
import PowerupRenderer from "@/view/renderers/PowerupRenderer";
import ShipRenderer    from "@/view/renderers/ShipRenderer";
import EnemyRenderer   from "@/view/renderers/EnemyRenderer";
import BossRenderer    from "@/view/renderers/BossRenderer";

export default {

    /**
     * create the renderer to represent given Actor on-screen
     *
     * @public
     * @param {Actor} actor
     * @param {RenderController} renderController
     * @return {Sprite}
     */
    createRenderer( actor, renderController ) {

        // return pooled renderer if one already existed

        if ( actor.pooled && actor.renderer )
            return actor.renderer;

        if ( actor instanceof Bullet ) {
            return new BulletRenderer( /** @type {Bullet} */ ( actor ), renderController );
        }
        else if ( actor instanceof Powerup ) {
            return new PowerupRenderer( /** @type {Powerup} */ ( actor ), renderController );
        }
        else if ( actor instanceof Boss ) {
            return new BossRenderer( /** @type {Boss} */ ( actor ), renderController );
        }
        else if ( actor instanceof Enemy ) {
            return new EnemyRenderer( /** @type {Enemy} */ ( actor ), renderController );
        }
        else if ( actor instanceof Ship ) {
            return new ShipRenderer( /** @type {Ship} */ ( actor ), renderController );
        }
        throw new Error( "could not create renderer for " + actor );
    },

    /**
     * ensure the appropriate spritesheet is used for given renderer
     *
     * @public
     * @param {Actor} actor
     * @param {Sprite} renderer
     */
    setSheetForRenderer( actor, renderer ) {

        if ( actor instanceof Boss )
            renderer.setSheetForBoss();

        else if ( actor instanceof Enemy )
            renderer.setSheetForEnemy();

        else if ( actor instanceof Powerup )
            renderer.setSheetForPowerup();
    }
};
