import { join, resolve } from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
// import handlebars from "vite-plugin-handlebars"; // not quite working with Vite 5, load templates raw instead

const dirAssets = join( __dirname, "src/assets" );
const dirJs     = join( __dirname, "src/js" );
const dirHtml   = join( __dirname, "src/templates" );
const dirDest   = join( __dirname, "dist" );

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
    base: "./",
    assetsInclude: [ "src/templates/**/*.hbs" ],
    build: {
        outDir: dirDest,
        // assetsDir: dirAssets,
        sourcemap: !isProd,
        minify: isProd,
    },
    resolve: {
        alias: {
            '@': dirJs,
            Templates: dirHtml
        },
    },
    plugins: [
        viteStaticCopy({
            targets: [
                { src: `${dirAssets}/images/graphics/**/*`, dest: "assets/images/graphics" },
                { src: `${dirAssets}/images/icons/**/*`,    dest: "assets/images/icons" },
                { src: `${dirAssets}/images/sprites/**/*`,  dest: "assets/images/sprites" },
                { src: `${dirAssets}/sounds/**/*`,          dest: "assets/sounds" },
            ]
        }),
        /*
        handlebars({
            partialDirectory: resolve( dirHtml, "runtime", "handlebars" ),
            compileOptions: {
                runtime: resolve( dirHtml, "runtime", "handlebars" ),
            },
        }),
        */
    ],
});
