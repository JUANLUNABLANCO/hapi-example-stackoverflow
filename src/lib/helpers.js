'use strict'

const Handlebars = require('handlebars'); // motor de plantillas

function registerHelpers() {
    // crear un helper personalizado
    Handlebars.registerHelper('answersNumber', (answers) => {
        const keys = Object.keys(answers); // ????
        return keys.length
    })
    Handlebars.registerHelper('ifEquals', (a, b, options) => {
        if (a == b) {
            return options.fn(this) // ejecutará lo que está dentro del bloque
        }
        return options.inverse(this) // sino invertirá la condición y ejecutará otra cosa
    })

    return Handlebars;
}

module.exports = registerHelpers();