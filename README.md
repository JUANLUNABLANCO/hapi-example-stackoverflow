# HAPI
## Instalaciones
> npmi init
> npm i -S hapi
> npm i -D nodemon standard
> npm i -S inert
> npm i -S vision
> npm i -S joi


## Configuraciones
--- package.json ---
scripts: [
  test: "npm run test",
  dev: "nodemon ./src/index.js", 
  // "dev": "nodemon --ext js,hbs ./src/index.js", para que revise cambios en las vistas de handlebars
  lint: "standard",
  lint-fix: "standard --fix"
]

.gitignore generator : Windows VisualStudioCode Node
--- .gitignore ---
node_modules ...
--- ---

> git init
> git status
> git add ./
> git commit -m "Proyecto api rest con HAPI: Mi primer commit"
> git remote add origin https://github.io/JUANLUNABLANCO/hapi-example-stackoverflow.git

## plugins 
### inert
plugin para servir ficheros staticos (idex.html, image.png, index.css, ...) carpeta public
> npm i -S inert
const Inert = requir4e('inert');
await Server.register(Inert);
### vision
plugin para renderizar desde el servidor con motor de plantillas handlebars
> npm install handlebars @hapi/vision --save
const Inert = requir4e('vision');
await Server.register(Vision);

### joi
plugin para validar campos de formularios o datos de una base de datos
> npm i -S joi
const Joi = requir4e('joi');
await Server.register(Joi);

### bcrypt
enciptar contraseñas para la base de datos
> npm i -S bcrypt


## Firebase
id del proyecto: stackoverflow-7e0ec

credentials (serviceAccount) to initialize app: ./src/config/firebaseAccess.json

> npm i firebase -S

databaseURL: 'https://stackoverflow-7e0ec-default-rtdb.europe-west1.firebasedatabase.app/'


## register/login 
ver ficheros: rutas, controladores, views y models user.model

## cookies desde el propio hapi
se crea la cookie en el servidor index.js

Server.state('user', {
  ttl: 1000 * 60 * 60 * 24 * 7  /// ms de una semana
  isSecure: process.env.NODE_ENV === 'production' // true o si no es production será false
  encoding: 'base64json'
})

una vez definida, podemos usarla en nuestras rutas
## control de errores
usaremos @hapi/boom

> npm i -S boom @hapi/boom

const Boom = require('@hapi/boom')
return Boom.badRequest('mensaje');
return Boom.unauthorized('mensaje');

saber más > https://hapi.dev/module/boom/

## enrutamiento avanzado

/rutaX/{param}
/ejemplo/{id}
const id = request.params.id

## el objeto Object.keys de js
teniendo el array siguiente
fruits= ['banana','platano','pera']
Object.keys(fruits)   // ['banana','platano','pera']

firebaseData = [
  121212121: {<objeto complejo>},
  34343434: {<objeto complejo>},
  6666777: {<objeto complejo>}, 
  ... ]
Object.keys(firebaseData) // [121212121, 34343434, 6666777]

const keys = Object.keys(answers)
return keys.length // retorna el número de objetos del array answers

## helpers

--- ./lib/helpers.js ---
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

module.exports = registerHelpers(); // se está ejecutando cuando llames al módulo 
--- ---
// el helper queda registrado como 'answerNumber', dentro de handlebars, el cual es requerido desde aquí en el index en vez desde el propio 'handlebars', así:

--- index.js ---
const Handlebars = require('./lib/helpers');
--- ---
--- question.hbs ---
{{#with user}}
{{#ifEquals parametroA parametroB}}
  <code here>
{{/ifEquals}}
{{/with}}
--- ---

## metodos de servidor
--- ./lib/serverMethods.js ---
'use strict'

const Question = require('../models/index').question

async function setAnswerRight(questionId, answerId, user) {
    let result = 'pollo';
    try {
        result = await Question.setAnswerRight(questionId, answerId, user)

    } catch (error) {
        console.error(error)
        return false
    }
    console.log(result) // undefined ????
    return result
}

async function getLast(amount) {
    let data;
    try {
        data = await Question.getLast(amount)
    } catch (error) {
        console.error(error)
        return false
    }
    // console.log('Método cacheado en el servidor')
    return data
}

module.exports = {
    setAnswerRight,
    getLast
}

--- answer ---
async setAnswerRight(questionId, answerId, user) {
        const query = await this.collection.child(questionId).once('value')
        const question = query.val()
        const answers = question.answers

        if (!user.email === question.owner.email) {
            return false
        }

        for (let key in answers) {
            answers[key].correct = (key === answerId); // true or false
        }

        const updateAnswers = await this.collection.child(questionId).child('answers').update(answers)
        console.log(updateAnswers); // no lo imprime porque no le sale ...
        return updateAnswers
    }
--- ---
--- question.controller.js ---
async function setAnswerRight(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    let result
    try {
        result = await request.server.methods.setAnswerRight(
            request.params.questionId,
            request.params.answerId,
            request.state.user)
    } catch (error) {
        request.log('ERROR', error)
    }
    return h.redirect(`/question/${request.params.questionId}`);
    // esto actualizará las answers, porue van en la data del view
}
--- ---

a partir del request puedes acceder a todos los métodos del servidor, tanto los definidos por hapi como los que hemos creado nosotros en el archivo serverMethods

request.server.methods.setAnswerRight(...)

// los parametros se reciben desde el frontend así:

--- routes.js ---
{
    method: 'GET',
    path: '/answer/{questionId}/{answerId}',
    handler: question.setAnswerRight
},
--- question.hbs ---
 {{#ifEquals ../../question.owner.email ../../user.email}}
    {{#unless answer.correct}}
    <a href="/answer/{{../../../../key}}/{{key}}" class="btn btn-primary" role="button">Elegir Respuesta 
    Correcta</a>
    {{!-- los ../../../../ son los niveles del contexto dentro de los brakets de handlebars, para obtener la key de arriba necesitamos subir 4 niveles --}}
    {{!-- el unless es para que el botón no salga en la respuesta que ya es correcta --}}
    {{/unless}}
    {{#if answer.correct}}
    <h3>
        <span class="badge badge-success" >Respuesta Correcta</span>
    </h3>
    {{/if}}
{{/ifEquals}}
--- ---
--- index.js ---
// definir esos métodos de servidor no es suficiente se necesitan registrar
// registrar metodos de servidor, disponibles en el objeto request.server.methods
    Server.method('setAnswerRight', methods.setAnswerRight)
    Server.method('getLast', methods.getLast, {
        cache: {
            expiresIn: 60 * 1000,
            generateTimeout: 2000 // si falla se recuperará tras este tiempo
        }
    })
--- ---

## handlebars anotaciones varias
1. lógica if/else
{{#if answer.correct}}
  {{classAlert='alert-success'}}
{{else}}
  {{classAlert='alert-info'}}
{{/if}}
<a class='{{classAlert}}' ...></a>

2. lógica with something
{{#with success}}
    <div class="alert alert-success" role="alert">
    {{this}}
    </div> 
{{/with}}

3. foreach
{{#each someQuestions as |question key|}}
    <div class="card bg-white mb-3">
        <h3>
            {{!-- ejecutamos el helper answersNumber mandandole el parámetro de las answers --}}
            {{#if question.answers}}
              {{answersNumber question.answers}}
            {{else}}
            0
            {{/if}}
        </h3>
        Respuestas
        <h4 class="mt-3">
          <a href="/question/{{key}}" class="text-dark">{{question.title}}</a>
         </h4>
         </div>
              {{#with question.filename}}
              <div class="col-2">
                  <img src="/assets/uploads/{{this}}"  style="width:100px" />
              </div>
              {{/with}}  
          </div>
        </div>
{{/each}}

4. contol de mensajes recibidos
{{#with error}}
  <div class="alert alert-danger" role="alert">
    {{this}}
  </div>
{{/with}}
{{#with success}}
  <div class="alert alert-success" role="alert">
  {{this}}
  </div> 
{{/with}}

5. el objeto this para pintar las imágenes
{{#with question.filename}}
  <div class="card" >
      <img class="card-img-top" src="/assets/uploads/{{this}}" alt="Card image cap">
      <div class="card-body">
          <a href="#" class="btn btn-primary">Ver en Codepen</a>
      </div>
  </div>
{{/with}}

## Manejo de la caché
caché de servidor y cahé de navegador
### Navegador/browser cache
    {
        method: 'GET',
        path: '/',
        handler: site.home,
        options: {
            cache: { // frontend cache
                expiresIn: 30 * 1000,
                privacy: 'private'
            }
        }
    },

### caché del servidor
Server.method('getLast', methods.getLast, {
        cache: {
            expiresIn: 60 * 1000,
            generateTimeout: 2000 // si falla se recuperará tras este tiempo
        }
    })

## subida de archivos (iamgenes) desde el frontend
---
> npm i uuid -S && npm i -S @hapi/boom 

--- question.model.js ---
async create(info, user, filename) {
        const data = {
            title: info.title,
            description: info.description,
            owner: user,
        };
        if (filename) { // puede venir o no es optativo del usuario
            data.filename = filename
        }

        const newQuestion = this.collection.push(data)
        return newQuestion.key
    }
--- ---
--- question.controller.js ---
'use strict'

const Boom = require('@hapi/boom')  // control de errores
const { writeFile } = require('fs') // escritura en ficheros
const { promisify } = require('util') // para crear una promesa de un metodo, tipo async await
const { join } = require('path')  // unir paths / o \ dependiendo del sistema operativo

const uuid = require('uuid/v1') // crea un id unico aleatorio

const Question = require('../models/index').question // el modelo

async function createQuestion(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    // const userData = request.payload
    let resultId;
    const Write = promisify(writeFile)

    try {
        // request.log('DATA', request.payload);
        if (Buffer.isBuffer(request.payload.image)) { // si llegó un archivo, será en un Buffer
            const filename = `${uuid()}.png` // genera nombre aleatorio, que no se repetirá nunca
            await Write(
                join(__dirname, '..', 'public', 'uploads', filename), // path to file
                request.payload.image, // binary content file image
                { // options
                    // encoding: 'utf8' // si fuese texto pues si
                    // mode: 0o666, // por defecto vale eso
                    flag: 'wx' // si existe lanza un error
                })
            resultId = await Question.create(request.payload, request.state.user, filename);

        }

        // request.log('DATA', result);
    } catch (error) {
        request.log('ERROR', error);
        // return h.response('Problemas creando el usuario').code(500);
        return h.view('create-question', {
            title: 'Asking question',
            error: 'Problemas creando la pregunta'
        })
    }
    return h.redirect(`question/${resultId}`)
        // return h.response(`Pregunta creada con el id: ${resultId}`)
}

--- ask.hbs ---
<form method="POST" action="create-question" enctype="multipart/form-data" >
    <div class="form-group">
        <label for="title">Título *</label>
        <input type="text" class="form-control" id="title" name="title" placeholder="Ingrese el título" required minlength="5" maxlength="100">
    </div>
    <div class="form-group">
        <label for="description">Descripción *</label>
        <textarea class="form-control" id="description" name="description" placeholder="Ingrese la descripción" required minlength="5" maxlength="1000"></textarea>
    </div>
    <div class="form-group">
        <label for="image">Imagen(png)</label>
        <input type="file" class="form-control" id="image" name="image" accept="image/png"></input>
    </div>
    <div class="text-center mt-5">
        <button type="submit" class="btn btn-primary">Crear Pregunta</button>
    </div>
</form>

// dos cosas de este formulario: 
1.  enctype="multipart/form-data"  necesario para subir ficheros
2.  <input type="file" class="form-control" id="image" name="image" accept="image/png"></input>
type="file" y accept="image/png", esto habrá que validarlo en el server

## Logging o registro de errores y procesos
tenemos el plugin good de hapi

> npm install -S @hapi/good

await server.register({
  plugin: require('@hapi/good'),
  options: {
      // ops: {
      //     interval: 2000
      // }, // si quieres mensajes del servidor cada 2 segundos
      reporters: {
          myConsoleReporters: [
              { module: require('@hapi/good-console') },  // salida através de un módulo
              'stdout'  // salida ordinaria consola
          ]
      }
  }
})

ahora podemos usar en vez de console.log('mensaje x')
server.log('#tag', 'mensaje') // tag es para tenerlos clasificados. #INFO, #ERROR, ETC
o desde el objeto request request.log('#BADREQUEST', 'mensaje')
request.log('DATA', request.payload); 

## Creación de plugins (api-rest plugin)
el objetivo es crear una api para que desarrolladores puedan obtener a partir de una url como esta
/api/some/question un json con la info rsultante desde la base de datos. tipo

ejemplo:
http://localhost:3000/api/question/-ND8O0Rb7sy_3lmdQXG1

resultado:
{
  "description": "esta es la pregunta del millón de $$$$",
  "owner": {
    "email": "juanmalunaaguado33@gmail.com",
    "name": "Juan manuel luna aguado"
  },
  "title": "La pregunta del millón"
}

--- ./lib/api-rest.js ---
'use strict'
const Joi = require('joi')
const Questions = require('../models/index').question
const Boom = require('@hapi/boom')

// creando el plugin 'api-rest' para 2 rutas questions.getOne(key) y questions.getLast(amount)
module.exports = {
    name: 'api-rest',
    version: '1.0.0',
    async register(server, options) {
        const prefix = options.prefix || 'api'
        server.route({
            method: 'GET',
            path: `/${prefix}/question/{key}`,
            options: {
                validate: {
                    params: Joi.object({
                        key: Joi.string().required()
                    }),
                    failAction: failValidation
                }

            },
            handler: async(request, h) => {
                let result
                try {
                    result = await Questions.getOne(request.params.key)
                    if (!result) {
                        Boom.notFound(`No se pudo encontrar esa pregunta: ${request.params.key}`)
                    }
                } catch (error) {
                    Boom.notFound(`Hubo un error buscando ${request.params.key} - ${error}`)
                }
                return result
            }
        })

        server.route({
            method: 'GET',
            path: `/${prefix}/questions/{amount}`,
            options: {
                validate: {
                    params: Joi.object({
                        amount: Joi.number().integer().min(1).max(20).required()
                    }),
                    failAction: failValidation
                }
            },
            handler: async(request, h) => {
                let result
                try {
                    result = await Questions.getLast(request.params.amount)
                    if (!result) {
                        Boom.notFound(`No se pudo recuperar las preguntas`)
                    }
                } catch (error) {
                    Boom.notFound(`Hubo un error buscando las preguntas - ${error}`)
                }
                return result

            }
        })

        function failValidation(request, h, err) {
            return Boom.badRequest('Por favor use los parámetros correctos')
        }
    }
}
--- ---
--- index.js ---
await Server.register({
        plugin: require('./lib/api-rest'),
        options: {
            prefix: 'api'
        }
    })
--- ---

## Authentication (startegies)
 como ya tenemos una authenticacion tipo clasica usuario contraseña en la app,
 hagamos una diferente en la api

> npm i -S hapi-auth-basic

--- api-rest.js ---
// authenticacion basica
const AuthBasic = require('hapi-auth-basic')
const User = require('../models/index').user

// registramos 
await server.register(AuthBasic)
// usamos auth.strategy
server.auth.strategy('simple', 'basic', { validate: validateAuth })

... 
// lo usamos en las rutas
  server.route({
    method: 'GET',
    path: `/${prefix}/question/{key}`,
    options: {
        auth: 'simple', 

...
 // creamos la funcion de validacion, dentro del register del plugin ver fichero api-rest.js
 async function validateAuth(request, username, passwd, h) {
    let user
    try {
        user = await User.validate({ email: username, password: passwd })
    } catch (error) {
        server.log('Error', error)
    }
    return {
        credentials: user || {},
        isValid: (user !== false)
    }
}
--- ---

Ahora cuando accedamos a cualquiera de las dos rutas de la api nos pedirá credenciales el propio navegador, sin necesidad de interfaz gráfica, pero si volvemos a solicitar no nos lo pide porque ya estamos logged

## SEGURIDAD FRENTE A ATAQUES CSRF Y XSSL
### CSRF
es la Falsificación de Petición en Sitios Cruzados o CSRF por sus sigles del inglés Cross-site request forgery, que es un tipo de ataque en el que son transmitidos comandos no autorizados por un usuario del sitio web en el que deberíamos confiar.

Para atender y corregir esta vulnerabilidad incorporaremos a nuestro proyecto un módulo adicional de Hapi llamado crumb que utiliza un token de validación para cada una de las rutas accedidas por los usuarios.

Implementación

Una vez instalado con 

> npm i crumb -S 

procedemos a registrarlo en el scrip principal, de la misma manera que hemos hecho antes con good.

const crumb = require('crumb')
...

await server.register({
  'plugin': crumb, 
  'options': {
    'cookieOptions': {
      'isSecure': process.env.NODE_ENV === 'production'
    }
  }
})
...
Crumb utiliza una cookie para realizar la validación del token en cada una de las rutas de nuestra aplicación y la contrasta con el valor de un input de tipo hidden y de nombre crumb, que debe estar presente en cada una de las vistas.

La propiedad isSecure estaría entonces activa (en true) cuando estemos en el entorno de producción e inactiva (en false) mientras estemos en el entorno de desarrollo. Cuando no está presente el input de validación o su valor no es el correcto, el servidor devuelve un código de error 403 al browser, indicando que el acceso está prohibido o no está autorizado.

En quellos formularios de la página insertaremos un input de tipo hidden llamado crumb
con el valor de esa cookie es decir value={{crumb}}

<input type="hidden" name="crumb" value={{crumb}}>

### XSS Cross Site Scripting atack
Otra de las vulnerabilidades que es muy común es XSS o Cross-site scripting, que es un tipo de ataque de seguridad por inyección en el que un atacante inyecta datos o algún script o códio malicioso desde otro sitio web diferente.

Para manejar y corregir esta vulnerabilidad en la seguridad de nuestra aplicación implementaremos la estrategia de CSP o Content Security Policy para definir específicamente los orígenes desde los cuales vamos a permitir la ejecución de scripts o el acceso a recursos desde y hacia nuestra aplicación. Para esto usaremos un par de plugins adicionales: Blankie y scooter (scooter por ser dependencia de blankie).

Instalamos ambos desde la terminal: npm i blankie scooter -S y requerimos ambos en nuestro script principal.

Al igual que los plugins anteriores, registramos blankie con las siguientes opciones:

await server.register ([ scooter, {
  'plugin': blankie,
  'options': {
    'defaultSrc': `'self' 'unself-inline' <urls adicionales>`,
    'styleSrc': `'self' 'unself-inline' <urls adicionales>`,
    'fontSrc': `'self' 'unself-inline' <urls adicionales>`,
    'scriptSrc': `'self' 'unself-inline' <urls adicionales>`,
    'generateNonces': false
  }
}])
Finalmente, al acceder a nuestra aplicación, notaremos que sólo serán permitidos los scripts y recursos que provengan desde las fuentes explícitamente definidas en las opciones indicadas al registrar el plugin, de lo contrario simplemente no se cargarán.

Si quieres aprender más sobre temas de Seguridad en la web, te invito a ver luego el Curso de Análisis de Vulnerabilidades Web con OWASP.

----------------------------------------------------------------------------------------------

Por lo visto el gran problema de Hapi es que no se mantiene el código de los plugins o no hay
compatibilidad entre versiones, esto es un problema a tener muy en cuenta.

---------------------------------------------------------------------------------------------


--------------------------------------------------------------------------------------
## NODE process.env
si queremos establecer variables de entorno podemos utilizar diferentes estrategias, teniendo en cuenta los ambientes,
(production, development, testing, debug, ...)

1. una forma simple sería en el package.json, así:
"scripts": {
        "start:test": "npx jest",
        "start:dev": "nodemon --ext js,hbs ./src/index.js",
        "start:debug": "set PORT=4000 && node --inspect ./src/index.js",
--- ---
set PORT=4000 --> es un comando que funciona en w10 powershell, y en linux

2. otra fórmula sería usar archivos de configuración .env y el paquete 

> npm i --save dot-env

para usarlo en el index de la siguiente manera:

require('dot-env').config()

puedes tener ficheros .env.dev  y .env.prod, no olvides agregarlos al .gitignore

3. Una tercera forma es usar el paquete 

>npm i --save cross-env

...
"start:debug": "cross-env PORT=4000 node --inspect ./src/index.js",


------------------------------------------------------------------------------------------
## Entendiendo Hapi
ver tutoriales de la documentación oficial y mis apuntes
https://hapi.dev/tutorials/?lang=en_US

## curso de platzi
Curso de Node.js con Hapi | Adrián Estrada | realizado con éxito

## proyecto de ejemplo
en la carpeta: E:\Mine\___NEWDEVELOP___\BOOTCAMP 01 EXPERT BACKEND DEVELOPER JS\04 Frameworks Nodejs + Typescript\01 HAPI\02-learn-hapi-master
hay un proyecto completo de ejemplo para aprender hapi, revisalo
-----------------------------------------------------------------------------------------------

## Problemas con endings lines in files
> git config core.autocrlf true  // configura el repo local para que las lineas finales sean por defecto CRLF, si quieres que sean LF debes colocarlo a false y ser consecuente en el .gitattributes

--- .gitattributes ---
* text=auto
* text eol=lf
--- ---

> git config --global core.autocrlf true  // lo mismo pero para todos los proyectos de tu máquina
No hace los cambios a menos que los edites

--- .gitattributes ---
// # Set the default behavior, in case people don't have core.autocrlf set.
* text=auto

// # Explicitly declare text files you want to always be normalized and converted
// # to native line endings on checkout.
*.c text
*.h text

// # Declare files that will always have CRLF line endings on checkout.
*.sln text eol=crlf

// # Denote all files that are truly binary and should not be modified.
*.png binary
*.jpg binary
--- ---
text=auto Git administrará los archivos de la manera que considere óptima. Esta es una buena opción predeterminada.

text eol=crlf Git siempre convertirá los finales de línea a CRLF durante la restauración. Debe usar esto para los archivos que tienen que conservar los finales CRLF, incluso en OSX o Linux.

text eol=lf Git siempre convertirá los finales de línea a LF durante la restauración. Deberías usar esto para los archivos que deben conservar los finales LF, incluso en Windows.

binary Git comprenderá que los archivos especificados no son de texto y no debería intentar cambiarlos. El valor binary también es un alias para -text -diff.

### pasos despues de usar giit config core.autocrlf true
1. > git add -u .      // grabar todo antes de comenzar los cambios
2. > git commit -m "Saving files before refreshing line endings"  // eso
3. > git add --renormalize .  // aplicar los cambios a todos los ficheros
4. > git status     // ver que ficheros se han reescrito
5. > git commit -m "Normalize all the line endings" // eso
6. > git push origin master/main    // subir los cambios



