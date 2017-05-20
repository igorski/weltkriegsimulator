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
"use strict";

const Pubsub          = require( "pubsub-js" );
const Messages        = require( "../definitions/Messages" );
const zCanvas         = require( "zcanvas" );
const RendererFactory = require( "../factory/RendererFactory" );
const SkyRenderer     = require( "../view/renderers/SkyRenderer" );
const TileRenderer    = require( "../view/renderers/TileRenderer" );
const FXRenderer      = require( "../view/renderers/FXRenderer" );
const Powerup         = require( "../model/actors/Powerup" );

let audioModel, gameModel, canvas, player, background;

// ideal width of the game, this is blown up by CSS
// for a fullscreen experience, while maintaining the "pixel art" vibe
// height will be calculated to use the same ratio as the available window size
const IDEAL_WIDTH = 400;

// all Actors apart from the Player
const actors = [];
let COLLIDABLE_TILE;

// create Sprites for each layer, they will not have any visual content
// of their own, but will act as containers (renderers for each of the
// Game's Actors will be added to their internal display lists)
// layers in order: ground, bottom actors, bottom decoration (e.g. non-collidable tiles), top actors, top decoration (e.g. clouds)
const layers = new Array( 5 );

let GROUND_LAYER            = 0;
let BOTTOM_ACTOR_LAYER      = 1;
let BOTTOM_DECORATION_LAYER = 2;
let TOP_ACTOR_LAYER         = 3;
let TOP_DECORATION_LAYER    = 4;

const COLORS = {
    TOP: "#0055d8",
    BOTTOM: "#990000"
};

// pool of renderers that show effects like transitions or explosions
const FXRenderers = new Array( 25 );

const RenderController = module.exports = {

    init( wks, container ) {

        audioModel = wks.audioModel;
        gameModel  = wks.gameModel;

        canvas = new zCanvas.canvas({
            width: IDEAL_WIDTH,
            height: IDEAL_WIDTH,
            animate: true,
            smoothing: false,
            stretchToFit: true,
            fps: 60,
            onUpdate: wks.gameModel.update
        });
        canvas.preventEventBubbling( true );
        canvas.setBackgroundColor( COLORS.TOP );
        canvas.insertInPage( container );

        setupGame();

        // add listeners for resize/orientation change so we can update the world
        // note: zCanvas will automatically stretch to fit (see its constructor)
        // so we don't have to worry about that in our code here

        window.addEventListener( "resize",            handleResize );
        window.addEventListener( "orientationchange", handleResize );

        // subscribe to messaging system

        [
            Messages.GAME_START,
            Messages.ACTOR_ADDED,
            Messages.ACTOR_REMOVED,
            Messages.ACTOR_EXPLODE,
            Messages.ACTOR_LAYER_SWITCH_START,
            Messages.ACTOR_LAYER_SWITCH_COMPLETE,
            Messages.PLAYER_HIT

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));
    },

    /**
     * invoked when an FXRenderer has completed its animation
     *
     * @public
     * @param {FXRenderer} renderer
     */
    onFXComplete( renderer ) {
        // remove renderer from zCanvas, return to pool
        removeRendererFromDisplayList( renderer );
        FXRenderers.push( renderer );
    },

    /**
     * @public
     * @type {{ active: boolean, x: number, y: number }}
     */
    rumbling: { active: false, x: 0, y: 0 }
};

/* private methods */

function setupGame() {

    clearGame();

    player = RendererFactory.createRenderer(
        gameModel.player, RenderController
    );

    for ( let i = 0; i < layers.length; ++i ) {
        const layer = new zCanvas.sprite({ width: 0, height: 0 });
        canvas.addChild( layer );
        layers[ i ] = layer;
    }

    // cache the layers into more readable names

    GROUND_LAYER            = layers[ 0 ];
    BOTTOM_ACTOR_LAYER      = layers[ 1 ];
    BOTTOM_DECORATION_LAYER = layers[ 2 ];
    TOP_ACTOR_LAYER         = layers[ 3 ];
    TOP_DECORATION_LAYER    = layers[ 4 ];

    COLLIDABLE_TILE = new TileRenderer( 0, -200, 1.5 );

    // add some default renderers for scenery

    GROUND_LAYER.addChild( new TileRenderer( 0, 0, 1, .5 ) );
    BOTTOM_DECORATION_LAYER.addChild( new SkyRenderer( 0, 0, .5 ) );
    TOP_ACTOR_LAYER.addChild( COLLIDABLE_TILE );
    TOP_DECORATION_LAYER.addChild( new SkyRenderer( canvas.getWidth() - 100, -100, 1 ) );

    // create Pool of top level renderers

    for ( let i = 0; i < FXRenderers.length; ++i )
        FXRenderers[ i ] = new FXRenderer( RenderController );

    // ensures optimal size
    handleResize();
}

function handleBroadcast( type, payload ) {

    let renderer;
    switch ( type ) {
        case Messages.GAME_START:
            addRendererToAppropriateLayer( gameModel.player.layer, gameModel.player.renderer );
            break;

        case Messages.ACTOR_ADDED:

            renderer = RendererFactory.createRenderer(
                payload, RenderController
            );
            addRendererToAppropriateLayer( /** @type {Actor} */ ( payload ).layer, renderer );
            actors.push( payload );
            break;

        case Messages.ACTOR_REMOVED:

            const index = actors.indexOf( /** @type {Actor} */ ( payload ));
            if ( index !== -1 )
                actors.splice( index, 1 );

            removeRendererFromDisplayList( /** @type {Actor} */ ( payload ).renderer );
            break;

        case Messages.ACTOR_EXPLODE:
            showExplodeAnimation( /** @type {Actor} */ ( payload ));
            break;

        case Messages.ACTOR_LAYER_SWITCH_START:
            showLayerSwitchAnimation( payload.actor, payload.layer );
            TweenMax.delayedCall( .5, () => checkLayerSwitchCollision( payload.actor, payload.layer ));
            break;

        case Messages.ACTOR_LAYER_SWITCH_COMPLETE:

            renderer = payload.actor.renderer;

            if ( renderer ) {
                removeRendererFromDisplayList( renderer );
                addRendererToAppropriateLayer( payload.layer, renderer );
            }
            break;

        case Messages.PLAYER_HIT:
            // rumble the screen when we're hit!
            if ( !( payload.object instanceof Powerup ))
                rumble();
            break;
    }
}

function clearGame() {

    if ( player ) {
        canvas.removeChild( player );
        canvas.removeChild( background );
    }
    let i = actors.length;
    while ( i-- ) {
        actors[ i ].dispose();
        actors.splice( i, 1 );
    }
    layers.forEach(( layer ) => layer.dispose());
}

function addRendererToAppropriateLayer( layer, renderer ) {

    // note that Actor layer indices don't match the indices
    // inside this controllers layer-index (we have decorative layers
    // that aren't part of the Game, thus contain no Actors!)

    switch ( layer ) {
        case 1:
            TOP_ACTOR_LAYER.addChild( renderer );
            break;
        case 0:
            BOTTOM_ACTOR_LAYER.addChild( renderer );
            break;
        default:
            BOTTOM_DECORATION_LAYER.addChild( renderer );
            break;
    }
}

function removeRendererFromDisplayList( renderer ) {

    if ( !renderer )
        return;

    const parent = renderer.getParent();
    if ( parent )
        parent.removeChild( renderer );
}

/**
 * create a rumbling animation by shaking the
 * on-screen actors around their current center point
 */
function rumble() {

    if ( RenderController.rumbling.active )
        return;

    RenderController.rumbling.active = true;

    const tl = new TimelineMax({ repeat: 5, onComplete: () => {
        RenderController.rumbling.active = false;
    }});
    tl.add( new TweenMax(
        RenderController.rumbling, .05, {
            "x": 5, "y": 5, "ease": Power1.easeInOut
        })
    );
    tl.add( new TweenMax(
        RenderController.rumbling, .05, {
            "x": 0, "y": 0, "ease": Power1.easeInOut
        })
    );
}

// TODO: does this belong here ? The tiles aren't actually Actors, but by
// treating them as collidable objects, we just made them so...

function checkLayerSwitchCollision( actor, targetLayer ) {

    // half way through the layer switch, move the actor to the target
    // layer for a better visual effect

    removeRendererFromDisplayList( actor.renderer );
    addRendererToAppropriateLayer( targetLayer, actor.renderer );

    // check if the Actor has collided with the scenery during layer switch
    // (e.g. the tiles present on the middle layer)
    // pixel transparency check to ensure we're not moving through holes in the tiles

    if ( zCanvas.collision.pixelCollision( actor.renderer, COLLIDABLE_TILE )) {
        actor.layer = 1;
        actor.die();

        if ( actor === gameModel.player )
            gameModel.onPlayerHit( null );
    }
}

function showExplodeAnimation( actor ) {
    // get FXRenderer from pool
    const renderer = FXRenderers.shift();
    if ( renderer ) {
        renderer.showAnimation( actor, FXRenderer.ANIMATION.EXPLOSION );
        addRendererToAppropriateLayer( actor.layer, renderer );
    }
}

function showLayerSwitchAnimation( actor, targetLayer ) {
    // get FXRenderer from pool
    const renderer = FXRenderers.shift();
    if ( renderer ) {
        renderer.showAnimation( actor, FXRenderer.ANIMATION.CLOUD );
        addRendererToAppropriateLayer( targetLayer, renderer );
    }
    if ( actor === player.actor ) {
        animateBackgroundColor( targetLayer );
        audioModel.setFrequency(( targetLayer === 1 ) ? 22050 : 990 );
    }
}

function handleResize() {
    // update the world viewport size in the GameModel
    // as this is used to determine boundaries for Actors
    gameModel.world.width  = canvas.getWidth();
    gameModel.world.height = canvas.getHeight();
    gameModel.player.cacheBounds();
}

function animateBackgroundColor( targetLayer ) {
    TweenMax.killTweensOf( canvas );
    TweenMax.to( canvas, 2, { _bgColor: ( targetLayer === 1 ) ? COLORS.TOP : COLORS.BOTTOM });
}
