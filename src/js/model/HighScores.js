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
import Messages from "../definitions/Messages";
import PubSub   from "pubsub-js";

const STORAGE_KEY = "wks.highscores";
let list;

/**
 * model that manages the list of
 * high scores within LocalStorage
 */
const HighScores = {

    /**
     * fetch the high scores from LocalStorage
     */
    init() {

        // when high scores are retrieved, save them into LocalStorage
        // this message based mechanism allows us to feed the high scores
        // from outside applications

        PubSub.subscribe( Messages.HIGH_SCORES_RETRIEVED, ( msg, payload ) => {

            if ( Array.isArray( payload )) {
                list = payload;
                save( list );
            }
        });
        retrieve();
    },

    /**
     * retrieve the list of high scores
     *
     * @return {Array<{name: string, score: number}>}
     */
    get() {
        return list;
    },

    /**
     * validates whether given score is
     * eligible to appear in the high scores list
     *
     * @param {number} score
     * @return {boolean}
     */
    isNewScore( score ) {
        const lowestScore = list[ list.length - 1 ].score;
        return score > lowestScore;
    },

    /**
     * save given name and score into the list of
     * high scores
     *
     * @param {string} name
     * @param {number} score
     */
    save( name, score ) {
        if ( HighScores.isNewScore( score )) {
            const newScore = { name: name, score: score };
            let i = list.length, found = false;
            while ( i-- ) {
                // replace last lower score with new score
                if ( list[ i ].score >= score ) {
                    // split list into two...
                    const head = list.splice( 0, i + 1 );
                    // ...and combine the list with the new high score entry in the middle
                    list = head.concat([ newScore ], list );

                    found = true;
                    break;
                }
            }

            // 1st place!

            if ( !found )
                list.unshift( newScore );

            // remove the last entry
            list.pop();

            save( list );

            // allows us to save the high scores in an outside application
            PubSub.publish( Messages.PLAYER_NAME_UPDATED, { name });
        }
    }
};
export default HighScores;

function retrieve() {
    let scores;
    try {
        const data = localStorage.getItem( STORAGE_KEY );
        if ( data ) {
            scores = JSON.parse( data );
        }
    }
    catch ( e ) {}

    // no high scores yet, create generic list

    if ( !Array.isArray( scores )) {
        scores = [
            { name: "AAA", score: 10000 },
            { name: "BBB", score: 9000 },
            { name: "CCC", score: 8000 },
            { name: "DDD", score: 7000 },
            { name: "EEE", score: 6000 },
            { name: "FFF", score: 5000 },
            { name: "GGG", score: 4000 },
            { name: "HHH", score: 3000 },
            { name: "III", score: 2000 },
            { name: "JJJ", score: 1000 }
        ];
    }
    PubSub.publish( Messages.HIGH_SCORES_RETRIEVED, scores );
}

function save( data ) {
    try {
        localStorage.setItem( STORAGE_KEY, JSON.stringify( data ));
        return true;
    }
    catch ( e ) {}
}
