const path              = require( "path" );
const webpack           = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HandlebarsPlugin  = require( "handlebars-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );

// Is the current build a development build
const IS_DEV = process.env.NODE_ENV === "dev";

const dirNode   = "node_modules";
const dirApp    = path.join( __dirname, "src" );
const dirAssets = path.join( __dirname, "src/assets" );
const dirSrc    = path.join( __dirname, "src/js" );

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        wks: path.join( dirSrc, "index" )
    },
    resolve: {
        modules: [
            dirNode,
            dirApp
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),

        new HtmlWebpackPlugin({

        }),

        new HandlebarsPlugin({
            entry  : path.join( process.cwd(), "src", "templates", "*.hbs" ),
            output : path.join( process.cwd(), "dist", "[name].html" ),
            data   : {},
            helpers: {
                toLowerCase: string => {
                    if ( typeof string === "string" ) {
                        return string.toLowerCase();
                    }
                    return "";
                },
                /**
                 * use in template like:
                 * {{loop 10}}
                 */
                loop: ( n, block ) => {
                    let out = "";
                    for( var i = 0; i < n; ++i ) {
                        out += block.fn( i );
                    }
                    return out;
                },
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
                eq: ( v1, v2 ) => v1 === v2,
                and: ( v1, v2 ) => v1 && v2,
                or: ( v1, v2 ) => v1 || v2
            }
        }),

        new CopyWebpackPlugin([
            { from: `${dirAssets}/images/graphics/**/*`, to: "assets/images/graphics", flatten: true },
            { from: `${dirAssets}/images/sprites/**/*`,  to: "assets/images/sprites",  flatten: true },
            { from: `${dirAssets}/fonts/**/*`,  to: "assets/fonts",  flatten: true },
            { from: `${dirAssets}/sounds/**/*`, to: "assets/sounds", flatten: true }
        ]),
    ],
    module: {
        rules: [
            // BABEL
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules)/,
                options: {
                    compact: true
                }
            },

            // STYLES
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: IS_DEV
                        }
                    }
                ]
            },

            // CSS / SASS
            {
                test: /\.scss/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: IS_DEV
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: IS_DEV,
                            includePaths: [dirAssets]
                        }
                    }
                ]
            },

            // IMAGES
            {
                test: /\.(jpe?g|png|gif)$/,
                loader: "file-loader",
                options: {
                    name: "[path][name].[ext]"
                }
            },

            // FONTS
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/"
                        }
                    }
                ]
            }
        ]
    }
};
