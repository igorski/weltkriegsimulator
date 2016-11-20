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

const Pubsub = require( "pubsub-js" );
const Messages = require( "../definitions/Messages" );
const zCanvas = require( "zcanvas" );
const RendererFactory = require( "../factory/RendererFactory" );
const SkyRenderer = require( "../view/SkyRenderer" );
const TileRenderer = require( "../view/TileRenderer" );

let gameModel, canvas, player, playerLayer, background;
const actors = []; // all Actors apart from the Player
const layers = [
    [], [], [], [], [] // ground, bottom actors, middle actors, top actors, sky
];

const RenderController = module.exports = {

    init( game, container ) {

        canvas = new zCanvas.canvas({
            width: 400,
            height: 400,
            animate: true,
            fps: 60,
            onUpdate: game.gameModel.update
        });
        canvas.insertInPage( container );

        setupGame( game.gameModel );

        // subscribe to messaging system

        [
            Messages.ACTOR_ADDED,
            Messages.ACTOR_REMOVED,
            Messages.ACTOR_LAYER_SWITCH,
            Messages.PLAYER_HIT

        ].forEach(( msg ) => Pubsub.subscribe( msg, handleBroadcast ));
    },

    /**
     * @public
     * @type {{ active: boolean, x: number, y: number }}
     */
    rumbling: { active: false, x: 0, y: 0 }
};

/* private methods */

function setupGame( aGameModel ) {

    gameModel = aGameModel;
    clearGame();

    player = RendererFactory.createRenderer(
        gameModel.player, RenderController
    );
    playerLayer = gameModel.player.layer;

    layers[0].push( new TileRenderer( 0, 0, 1, .5 ) ); // ground
    layers[2].push( new SkyRenderer( 0, 0, 1 ) ); // middle actor layer
    layers[3].push( new TileRenderer( 0, -200, 1.5 ) ); // top actor layer
    layers[4].push( new SkyRenderer( canvas.getWidth() - 100, -100, 2 ) ); // sky layer

    player.x = canvas.getWidth() / 2 - player.width / 2;
    player.y = canvas.getHeight() - player.height;

    // will trigger organization of Display List
    addRendererToAppropriateLayer( gameModel.player );
}

function handleBroadcast( type, payload ) {

    let renderer;
    switch ( type ) {
        case Messages.ACTOR_ADDED:

            renderer = RendererFactory.createRenderer(
                payload, RenderController
            );
            addRendererToAppropriateLayer( payload );
            actors.push( payload );
            break;

        case Messages.ACTOR_REMOVED:

            const index = actors.indexOf( payload );
            if ( index !== -1 )
                actors.splice( index, 1 );

            removeRendererFromDisplayList( payload );
            break;

        case Messages.ACTOR_LAYER_SWITCH:

            renderer = payload.renderer;

            if ( renderer ) {
                removeRendererFromDisplayList( payload );
                addRendererToAppropriateLayer( payload );
            }
            break;

        case Messages.PLAYER_HIT:
            rumble();
            break;
    }
}

function clearGame() {

    if ( player ) {
        canvas.removeChild( player );
        canvas.removeChild( background );
    }
    let amountOfActors = actors.length;
    while ( amountOfActors-- ) {
        actors[ amountOfActors ].dispose();
        actors.splice( i, 1 );
    }
    for ( let i = 0; i < layers.length; ++i )
        layers[ i ] = [];
}

function organiseDisplayListByLayers() {

    let i = canvas.getChildren().length;
    while ( i-- > 0 )
        canvas.removeChildAt( 0 );

    layers.forEach(( layer ) => {
        layer.forEach(( renderer ) => canvas.addChild( renderer ));
    });
}

function addRendererToAppropriateLayer( actor ) {

    const renderer = actor.renderer;

    // note that Actor layer indices don't match the indices
    // inside this controllers layer-index (we have decorative layers
    // that aren't part of the Game, thus contain no Actors!)

    switch ( actor.layer ) {
        case 0: // top actor layer
            layers[ 3 ].push( renderer );
            break;
        case 1: // bottom actor layer
            layers[ 1 ].push( renderer );
            break;
        default: // middle actor layer
            layers[ 2 ].push( renderer );
            break;
    }

    // player is always on top of his respective layer

    if ( actor === gameModel.player ) {
        playerLayer = actor.layer;
    }
    else {
        const index = ( playerLayer === 0 ) ? 3 : 1; // see switch above for indices
        layers[ index ].splice( layers[ index ].indexOf( player ), 1 );
        layers[ index ].push( player );
    }
    organiseDisplayListByLayers();
}

function removeRendererFromDisplayList( actor ) {

    const renderer = actor.renderer;
    let found = false;

    layers.forEach(( layer ) => {

        if ( found )
            return;

        let i = layer.length;
        while ( i-- ) {
            if ( layer[ i ] === renderer ) {
                layer.splice( i, 1 );
                found = true;
                break;
            }
        }
    });
    canvas.removeChild( renderer );

    if ( !found )
        debugger;
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
