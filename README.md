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

## archivos
const Boom = require('@hapi/boom')
const { writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')
---
> npm i uuid -S
--- 
const uuid = require('uuid/v1')

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


y una tercera opció

------------------------------------------------------------------------------------------
## Entendiendo Hapi
ver tutoriales de la documentación oficial y mis apuntes
https://hapi.dev/tutorials/?lang=en_US

## curso de platzi
Curso de Node.js con Hapi | Adrián Estrada | realizado con éxito

## proyecto de ejemplo
en la carpeta: E:\Mine\___NEWDEVELOP___\BOOTCAMP 01 EXPERT BACKEND DEVELOPER JS\04 Frameworks Nodejs + Typescript\01 HAPI\02-learn-hapi-master
hay un proyecto completo de ejemplo para aprender hapi, revisalo




