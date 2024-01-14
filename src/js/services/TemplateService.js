import Handlebars from "handlebars";

/* public API */

/**
 * Renders a template (raw Handlebars file as string) with
 * optionally provided options as a HTML string
 */
export function renderTemplate( templateString, opts = {}) {
    return Handlebars.compile( templateString )( opts );
}

/* custom helpers available to the templates */

Handlebars.registerHelper( "toLowerCase", string => {
    if ( typeof string === "string" ) {
        return string.toLowerCase();
    }
    return "";
});

/**
 * use in template like:
 * {{loop 10}}
 */
Handlebars.registerHelper( "loop", ( n, block ) => {
    let out = "";
    for ( let i = 0; i < n; ++i ) {
        out += block.fn( i );
    }
    return out;
});
/**
 * comparison functions for templates, use like:
 * {{#if (eq variable "value")}} ... {{/if}}
 *
 * multiple conditionals:
 *
 * {{#if (and
 *           (eq variable "value")
 *           (eq variable2 "value"))
 * }}
 */
Handlebars.registerHelper( "eq",  ( v1, v2 ) => v1 === v2 );
Handlebars.registerHelper( "and", ( v1, v2 ) => v1 && v2 );
Handlebars.registerHelper( "or",  ( v1, v2 ) => v1 || v2 );
Handlebars.registerHelper( "add", ( v1, v2 ) => v1 + v2 );
