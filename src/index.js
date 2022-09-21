'use strict'

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert'); // plugin para ofrecer archivos estáticos
const Path = require('path');

const Init = async() => {
    const Server = new Hapi.Server({
        port: process.env.PORT || 3000,
        host: process.env.URL_HOST || 'localhost',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    })

    await Server.register(Inert);

    Server.route({
        method: 'GET',
        path: '/home',
        handler: {
            file: 'index.html'
        }
    })

    Server.route({
        method: 'GET',
        path: '/diferentResponses',
        handler: (request, h) => {
            const user = {
                    firstName: 'John',
                    lastName: 'Doe',
                    userName: 'JohnDoe',
                    id: 123
                }
                // return 'Hello world!'
                // return h.response('Hola Mundo, desde Hapi usando el objeto h.response').code(200);
                // return h.redirect('http://www.platzi.com')
            return user
        }
    })

    Server.route({
        method: 'GET',
        path: '/hello/{name?}',
        handler: (request, h) => {

            const name = request.params.name ? request.params.name : 'Pollo';
            return 'Hello ' + name
        }
    });

    Server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                index: ['index.html']
            }
        }
        // handler: {
        //     directory: {
        //         path: '.',
        //         redirectToSlash: true,
        //         index: true,
        //     }
        // }
    })


    await Server.start()


    console.log(`Servidor lanzado en: ${Server.info.uri}`)
}

// otra manera de manejar los errores
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

Init()