module.exports =
{
    vendor: {
        src : [ "node_modules/gsap/src/minified/TweenMax.min.js",
                "node_modules/gsap/src/minified/easing/EasePack.min.js",
                "node_modules/gsap/src/minified/plugins/CSSPlugin.min.js",
                "node_modules/gsap/src/minified/plugins/ScrollToPlugin.min.js"
               ],
        dest : "<%= config.target.env %>/vendor/vendor.js"
    },

    // copy handlebars runtime and templates

    handlebars: {
        src: [
            "<%= config.project.modules %>/handlebars/dist/handlebars.runtime.min.js",
            "<%= config.target.env %>/handlebars/templates.js"
        ],
        dest: "<%= config.target.env %>/handlebars/handlebars.js"
    },

    // concatenate the vendor with custom application code

    prod: {
        src: [
            "<%= config.target.env %>vendor/vendor.js",
            "<%= config.target.env %><%= pkg.name %>.js"
        ],
        dest: "<%= config.target.env %><%= pkg.name %>.js"
    }
};
