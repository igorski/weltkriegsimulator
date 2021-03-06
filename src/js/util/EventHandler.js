/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2014 - 2017 - http://www.igorski.nl
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
module.exports = EventHandler;

/**
 * an EventHandler provides an interface to attach event listeners
 * to DOM elements without having to worry about pesky cross browser implementations
 *
 * EventHandler inherits from the Disposable Object allowing it to clean up
 * all added listeners in one go by invoking dispose when the EventHandler is cleared
 *
 * @extends {Disposable}
 */
function EventHandler() {
    /**
     * @private
     * @type {Array.<{ element: Element, type: string, listener: !Function}>}
     */
    this._mappedEvents = [];
}

/* public methods */

/**
 * attach a listener and an event handler to an element
 * NOTE : only ONE callback can be assigned to a specific type
 *
 * @param {Element|EventDispatcher} aElement
 * @param {string} aType
 * @param {!Function} aCallback
 * @param {boolean|Object=} aOptOptions
 *
 * @return {boolean} whether the listener has been attached successfully
 */
EventHandler.prototype.listen = function( aElement, aType, aCallback, aOptOptions ) {
    if ( !this.isListening( aElement, aType )) {
        if ( aElement.addEventListener ) {
            aElement.addEventListener( aType, aCallback, aOptOptions || false );
        }
        else if ( aElement.attachEvent ) {
            aElement.attachEvent( "on" + aType, aCallback );
        }
        else {
            return false;
        }
        this._mappedEvents.push({ "element" : aElement, "type" : aType, "listener" : aCallback });
        return true;
    }
    return false;
};

/**
 * remove a previously registered handler from an element
 *
 * @public
 *
 * @param {Element|EventDispatcher} aElement
 * @param {string} aType
 *
 * @return {boolean} whether the listener has been found and removed
 */
EventHandler.prototype.unlisten = function( aElement, aType ) {
    let i = this._mappedEvents.length;
    while ( i-- ) {
        const theMapping = this._mappedEvents[ i ];

        if ( theMapping.element === aElement && theMapping.type === aType )
        {
            if ( aElement.removeEventListener ) {
                aElement.removeEventListener( aType, theMapping.listener, false );
            }
            else if ( aElement.detachEvent ) {
                aElement.detachEvent( "on" + aType, theMapping.listener );
            }
            else {
                return false;
            }
            this._mappedEvents.splice( i, 1 );
            return true;
        }
    }
    return false;
};

/**
 * query whether a listener for a specific event type has already
 * been registered for the given element
 *
 * @param {Element|EventDispatcher} aElement
 * @param {string} aType
 *
 * @return {boolean} whether the listener already exists
 */
EventHandler.prototype.isListening = function( aElement, aType ) {
    let i = this._mappedEvents.length;

    while ( i-- ) {
        const theMapping = this._mappedEvents[ i ];

        if ( theMapping.element === aElement &&
             theMapping.type    === aType ) {
            return true;
        }
    }
    return false;
};

/**
 * @public
 */
EventHandler.prototype.dispose = function() {
    let i = this._mappedEvents.length;

    while ( i-- ) {
        const mapping = this._mappedEvents[ i ];
        this.unlisten( mapping.element, mapping.type );
        this._mappedEvents.splice( i, 1 );
    }
};
