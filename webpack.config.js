const path              = require( "path" );
const webpack           = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );

// Is the current build a development build
const IS_DEV = process.env.NODE_ENV === "dev";

const dirNode   = "node_modules";
const dirApp    = path.join( __dirname, "src" );
const dirAssets = path.join( __dirname, "src/assets" );
const dirSrc    = path.join( __dirname, "src/js" );
const dirHtml   = path.join( __dirname, "src/templates" );
const dirDest   = path.join( __dirname, "dist" );

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        wks: path.join( dirSrc, "index" )
    },
    output: {
        /**
         * With zero configuration,
         *   clean-webpack-plugin will remove files inside the directory below
         */
        path: dirDest,
    },
    resolve: {
        alias: {
            '@': dirSrc,
            Templates: dirHtml
        },
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
            // only here to create self serving page in dev mode
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: `${dirAssets}/images/graphics/**/*`, to: path.resolve( dirDest, "assets", "images", "graphics", "[name][ext]" ) },
                { from: `${dirAssets}/images/icons/**/*`,    to: path.resolve( dirDest, "assets", "images", "icons", "[name][ext]" ) },
                { from: `${dirAssets}/images/sprites/**/*`,  to: path.resolve( dirDest, "assets", "images", "sprites", "[name][ext]" ) },
                { from: `${dirAssets}/sounds/**/*`,          to: path.resolve( dirDest, "assets", "sounds", "[name][ext]" ) }
            ]
        }),
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

            // CSS / SASS
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: IS_DEV,
                            sassOptions: {
                                includePaths: [dirAssets]
                            },
                        },
                    }
                ]
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
            },

            // HANDLEBARS
            {
                test: /\.(handlebars|hbs)$/,
                loader: "handlebars-loader",
                options: {
                    runtime: path.resolve( dirHtml, "runtime/handlebars" )
                },
            }
        ]
    }
};
