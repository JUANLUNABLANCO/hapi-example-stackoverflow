'use strict'

const Hapi = require('@hapi/hapi'); // framework core
const Inert = require('@hapi/inert'); // plugin para ofrecer archivos estáticos
const Vision = require('@hapi/vision'); // plugin para servir plantillas renderizar desde el servidor
const Crumb = require('crumb'); // plugin contra el CSRF @hapi/crumb
const Blankie = require('blankie'); // plugin contra e XSS, depende de scooter
const Scooter = require('@hapi/scooter') // plugin que ayuda al anterior

const methods = require('./lib/serverMethods'); // metodos de servidor disponibles en plantillas de hnadlebars y en cualquier parte

const Routes = require('./routes'); // array de rutas que son objetos

const Site = require('./controllers/sites.controller'); // controlador, necesario para el file not found

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

    // insertará un token en las cabeceras de las peticiones, para hacerlo seguro
    await Server.register({
        'plugin': Crumb,
        'options': {
            'cookieOptions': {
                'isSecure': process.env.NODE_ENV === 'production'
            }
        }
    })

    // ###################################################### no funciona bien
    // await Server.register(
    //     [Scooter, {
    //         plugin: Blankie,
    //         options: { // por defecto es 'self' de todas formas esto no funciona bien
    //             defaultSrc: `'self'  'unself-inline' https://cdn.jsdelivr.net/`,
    //             styleSrc: `'self' 'unself-inline' `,
    //             fontSrc: `'self'  'unself-inline' data: https://fonts.gstatic.com`,
    //             scriptSrc: `'self'  'unself-inline' https://cdn.jsdelivr.net/ https://code.jquery.com/`,
    //             generateNonces: false
    //         }
    //     }]
    // )  

    // ###################################################### no funciona bien

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
    Server.ext('onPreResponse', Site.fileNotFound);

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