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

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        wks: path.join( dirSrc, "index" )
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

        new CopyWebpackPlugin([
            { from: `${dirAssets}/images/graphics/**/*`, to: "assets/images/graphics", flatten: true },
            { from: `${dirAssets}/images/icons/**/*`,    to: "assets/images/icons",    flatten: true },
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
