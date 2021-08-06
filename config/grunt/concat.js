module.exports =
{
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
            "<%= config.target.env %><%= pkg.name %>.js"
        ],
        dest: "<%= config.target.env %><%= pkg.name %>.js"
    }
};
