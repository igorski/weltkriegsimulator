module.exports = {
    dev: ['<%= config.target.dev %>**'],
    prod: ['<%= config.target.prod %>**'],
    prodTemp: ['<%= config.target.prod %>vendor/**' ]
};