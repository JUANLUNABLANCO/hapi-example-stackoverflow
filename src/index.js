'use strict'

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert'); // plugin para ofrecer archivos estáticos
const Vision = require('@hapi/vision');

const methods = require('./lib/serverMethods');

const Routes = require('./routes');
const site = require('./controllers/sites.controller');

const Handlebars = require('./lib/helpers'); // motor de plantillas
const Path = require('path');

const Init = async() => {
    // creando el servidor
    const Server = new Hapi.Server({
            port: process.env.PORT || 3000,
            host: process.env.URL_HOST || 'localhost',
            routes: {
                files: {
                    relativeTo: Path.join(__dirname, 'public')
                }
            }
        })
        // registro de plugin y/o modulos
    await Server.register(Inert);
    await Server.register(Vision);
    await Server.register({
        plugin: require('@hapi/good'),
        options: {
            // ops: {
            //     interval: 2000
            // },
            reporters: {
                myConsoleReporters: [
                    { module: require('@hapi/good-console') },
                    'stdout'
                ]
            }
        }
    });
    await Server.register({
        plugin: require('./lib/api-rest'),
        options: {
            prefix: 'api'
        }
    })

    // definir metodos de servidor, disponibles en el objeto request.server.methods
    Server.method('setAnswerRight', methods.setAnswerRight)
    Server.method('getLast', methods.getLast, {
        cache: {
            expiresIn: 60 * 1000,
            generateTimeout: 2000 // si falla se recuperará tras este tiempo
        }
    })

    // cookies de usuario
    Server.state('user', {
        ttl: 1000 * 60 * 60 * 24 * 7,
        isSecure: process.env.NODE_ENV === 'production',
        encoding: 'base64json'
    });
    // vistas
    Server.views({
        engines: {
            hbs: Handlebars
        },
        relativeTo: __dirname,
        path: './views',
        layout: true,
        layoutPath: './views/layouts'

    });

    // interceptamos el envío, por si algun file no se encuentra
    Server.ext('onPreResponse', site.fileNotFound);

    // Server.route(...)
    Server.route(Routes);

    await Server.start()


    Server.log('SERVER-INFO:', `Servidor lanzado en: ${Server.info.uri}`)
}

// otra manera de manejar los errores
process.on('unhandledRejection', (err) => {
    console.error('UnhandledRejection', err.message, err);
    // Server.log('UnhandledRejection', err);
    process.exit(1);
});
process.on('unhandledException', (err) => {
    console.error('UnhandledException', err.message, err);
    // Server.log('UnhandledException', err);
    process.exit(1);
});

Init()