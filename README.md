WELTKRIEGSIMULATOR
==================

_Weltkriegsimulator_ (WKS) is a vertical scrolling shoot 'em up that was created to showcase the
possibilities of creating a game using the open source [zCanvas library](https://github.com/igorski/zCanvas).

You can play the game directly in your browser by [navigating here](https://www.igorski.nl/weltkriegsimulator).

Project requirements
--------------------

WKS is a Javascript project (ES6) and uses the CommonJS require/exports-pattern. The dependencies are
managed via NPM and the build scripts are written in Grunt.

The only requirement on your system is to have Node.js installed. With Node installed, you can resolve all
dependencies via command line using:

`npm install`

You can start the dev mode through the following NPM task:

`npm run dev`

This mode will launch a local server allowing you to debug the application from your browser through the
local URL _http://localhost:3000_. When you make changes / additions to the source files, a watcher will
register the changes, rebuild the application and refresh the browser so you can see the effect of your
changes directly.

You can create a production ready package by running:

`npm run build`

Project outline
---------------

WKS uses no framework but was written in vanilla JS. The only used libraries besides the aforementioned _zCanvas_
are _TweenMax_ (easing functions), _Handlebars_ (for HTML templating) and _pubsub-js_ (for messaging).

All source code resides in the _./src/js_-directory. The main application logic is split
up into:

 * controllers
 * factory
 * model
 * view

The _controllers_ are responsible for managing changes in the model and updating the appropriate views. These
controllers are:

 * _GameController_ sets up the game, changes game world properties, delegates changes in game state (through _ActionFactory.js_)
 * _InputController_ listens to keyboard/touch input and delegates these actions onto the Player
 * _RenderController_ maintains the zCanvas that will render all of the game's Actors on the screen as well as manage audio events
 * _ScreenController_ overlays different screens (e.g. title screen, game UI, high scores list)

The _views_ represent each of the screens used in the game. They are managed by their appropriate controllers.
Note: for the game elements (the Actors) these are represented by _renderers_ (see _zCanvas in WKS_ below).

The _models_ contain all data and properties. For the game's model (_Game.js_) this is where the
state and contents of the game's "world" are held. Apart from generic world properties determining the
game's behaviour and progress, this model also references the _Actors_. The Actors are instances of all
Objects in the game (for instance: the player, bullets, powerups, enemy ships). These share common properties
such as coordinates, speed, but have their own custom properties (e.g. energy, weapon damage, etc.). These
Actors are defined as ES6 classes as the Object Oriented Pattern works well for inheritance purposes. The
remainder of the applications business logic follows the Functional Programming pattern.

Finally, the _factories_ are used to generate data to populate the models. _ActionFactory_ is of interest as
it generates the enemy waves and the powerups.

Communication between these models, views and controllers is done using the publish-subscribe pattern where
messages are broadcast to subscribed listeners to act upon. As such, different players might be interested in
the same message for the same purpose (for instance: a message of GAME_OVER might trigger the _GameController_ to
stop the action queue and freeze the game loop, while at the same time the _InputController_ decides to stop
listening to input events and the _ScreenController_ to open the high score input screen. "Separate the concerns"!

zCanvas in WKS
--------------

The zCanvas is used to render the game "world". All other visual components (energy bar, score, menus, etc.) are
overlaid in HTML.

The zCanvas is maintained by _RenderController_. It is this controller that creates the zCanvas, sizes it
accordingly and manages its display list. In WKS, there are multiple layers in the world to give the illusion
of depth. Each of the games actors are appended to the appropriate according layer.

The visual representation of an Actor is done using a zCanvas _zSprite_. We refer to these instances as
_renderers_. All zCanvas renderers reside in the _./src/js/view/renderers_-directory. A renderers only job is
to _visually represent the state of the Actor_. Game.js knows nothing about renderers, and it doesn't have to, it
merely updates the actors in the game world.

On each render cycle (60 times per second) of the zCanvas, zCanvas requests an _update()_ from the Game, subsequently
it will draw all renderers onto the screen. Consult the [zCanvas wiki](https://github.com/igorski/zCanvas/wiki) to
learn about the API.

Note zCanvas is _always_ on-screen, the different screens (e.g. Title, High Scores, etc.) are overlaid on top (see
_ScreenController.js_).

TweenMax in WKS
---------------

TweenMax is a powerful animation engine by Greensock. Within WKS it is used to perform easing functions on
Actors which in turn are visualised as animations. Additionally, TweenMax is also a convenient timing engine, instead
of relying on _setTimeout()_ (which fires when the browser tab is suspended and can drift), we use _TweenMax.delayedCall()_
which is rock solid and can pause when the applications tab suspends.

Object pooling
--------------

A vertical scrolling shoot 'em up is pure mayhem with a lot of Objects being in use simultaneously, as well
a lot of generation / removal of Actors.

For this purpose, this application uses pooling. When a resource is no longer needed (for instance: bullet
is out of screen bounds), it is not disposed, but returned to the pool. The next time a new instance of
that type (for instance: newly fired bullet) is needed, it is retrieved from the pool and updated to have
the appropriate properties (e.g. new position, direction, etc.). This pool is maintained by _Game.js_.

Apart from game Actors pools, there is also a pool for decorative effects (e.g. explosions which are
triggered by Actors, but not actually an Actor by themselves). These are managed by _RenderController.js_.
