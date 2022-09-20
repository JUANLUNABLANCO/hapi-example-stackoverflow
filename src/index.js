'use strict'

const Hapi = require('hapi')

const Server = Hapi.Server({
    port: process.env.PORT || 3000,
    host: process.env.URL_HOST || 'localhost'
})

async function init() {
    Server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hola Mundo, desde Hapi'
        }
    })

    try {
        await Server.start()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
    console.log(`Servidor lanzado en: ${Server.info.uri}`)
}

init()