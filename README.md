WELTKRIEGSIMULATOR
==================

_Weltkriegsimulator_ (WKS) is a vertical scrolling shoot 'em up that was created to showcase the
possibilities of creating a game using the open source [zCanvas library](https://github.com/igorski/zCanvas).

Project requirements
--------------------

WKS is a Javascript project (ES6) and uses the CommonJS require/exports-pattern. The dependencies are
managed via NPM and the build scripts are written in Grunt.

The only requirement on your system is to have Node.js installed. With Node installed, you can resolve all
dependencies via command line using:

    npm install
    
You can start the dev mode by running:

    grunt dev
    
This mode will launch a local server allowing you to debug the application on _http://localhost:9001_.
When you make changes / additions to the source files, a watcher will register the changes, rebuild the
application and refresh the browser.

You can create a production ready package by running:

    grunt build

Project outline
---------------

WKS uses no framework but was written in vanilla JS. The only used libraries besides the aforementioned _zCanvas_
are _TweenMax_ by Greensock and _Handlebars_.

All source code resides in the _./src/js_-directory. The main application logic is split
up into:

 * controllers
 * model
 * view
 
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
